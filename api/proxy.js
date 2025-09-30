// api/proxy.js
const http = require('http');
const https = require('https');
const querystring = require('querystring');

module.exports = (req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return;
  }

  // Handle health check
  if (req.url === '/api/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'WRIS Proxy Serverless Function',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Only handle WRIS API routes
  if (!req.url.startsWith('/wris/')) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
    return;
  }

  const proxyPath = req.url.replace('/wris', '');

  // Prepare the request data for POST
  let body = '';
  if (req.method === 'POST') {
    body = JSON.stringify(req.body || {});
  }

  // Handle different WRIS endpoints
  const endpointMap = {
    '/rainfall': '/Dataset/RainFall',
    '/groundwater': '/Dataset/Ground%20Water%20Level',
    '/soil': '/Dataset/Soil%20Moisture'
  };

  const endpoint = Object.keys(endpointMap).find(key => proxyPath.startsWith(key));
  if (!endpoint) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify({
      error: 'Invalid endpoint',
      available: Object.keys(endpointMap)
    }));
    return;
  }

  const targetPath = endpointMap[endpoint];
  const { stateName, districtName, startdate, enddate } = req.body || {};

  if (!stateName || !districtName) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify({
      error: 'Missing required parameters',
      required: ['stateName', 'districtName']
    }));
    return;
  }

  // Prepare form data for WRIS API
  const formData = {
    stateName: stateName.toUpperCase(),
    districtName: districtName.toUpperCase(),
    agencyName: endpoint === '/rainfall' ? 'CWC' : endpoint === '/groundwater' ? 'CGWB' : 'NRSC VIC MODEL',
    startdate: startdate || '2024-01-01',
    enddate: enddate || '2024-12-31',
    download: 'false',
    page: '0',
    size: '1000'
  };

  const postData = querystring.stringify(formData);

  const options = {
    hostname: 'indiawris.gov.in',
    port: 443,
    path: targetPath,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'AquaPlan/1.0.0',
      'Accept': 'application/json'
    }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let data = '';

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    proxyRes.on('data', (chunk) => {
      data += chunk;
    });

    proxyRes.on('end', () => {
      res.statusCode = proxyRes.statusCode;
      res.setHeader('Content-Type', 'application/json');

      try {
        const jsonData = JSON.parse(data);

        // Add metadata for frontend
        jsonData.metadata = {
          service: 'WRIS ' + endpoint.slice(1),
          location: `${districtName}, ${stateName}`,
          dateRange: `${formData.startdate} to ${formData.enddate}`,
          agency: formData.agencyName,
          timestamp: new Date().toISOString()
        };

        res.end(JSON.stringify(jsonData));
      } catch (error) {
        res.end(data);
      }
    });
  });

  proxyReq.on('error', (error) => {
    console.error('Proxy error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify({
      error: 'Proxy error',
      message: error.message,
      endpoint: endpoint,
      location: `${stateName}, ${districtName}`
    }));
  });

  proxyReq.setTimeout(30000, () => {
    proxyReq.destroy();
    res.statusCode = 408;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify({
      error: 'Request timeout',
      endpoint: endpoint,
      location: `${stateName}, ${districtName}`
    }));
  });

  proxyReq.write(postData);
  proxyReq.end();
};
