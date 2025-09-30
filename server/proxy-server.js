// server/proxy-server.js - Updated WRIS API Server with Retry and Timeout Fix

const express = require('express');
const cors = require('cors');
const https = require('https');
const querystring = require('querystring');
require('dotenv').config();

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.FRONTEND_URL,
    'https://jal2.vercel.app',
    'https://*.vercel.app'
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'Cache-Control'],
  maxAge: 86400 // 24 hours preflight cache
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();

  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);

  if (req.method === 'POST' && req.body) {
    const { stateName, districtName, startdate, enddate } = req.body;
    console.log(`📍 Request: ${stateName || 'N/A'}/${districtName || 'N/A'} | ${startdate || 'N/A'} to ${enddate || 'N/A'}`);
  }

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
});

async function proxyWRIS(endpoint, params, retries = 2) {
  const timeoutMs = parseInt(process.env.WRIS_TIMEOUT || '60000');

  const postData = querystring.stringify(params);

  const options = {
    hostname: 'indiawris.gov.in',
    port: 443,
    path: endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'Mozilla/5.0 (compatible; AquaPlan/1.0)',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    },
    timeout: timeoutMs
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.setEncoding('utf8');

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          const errMsg = `WRIS API responded with status ${res.statusCode}`;
          console.error(errMsg);
          reject(new Error(errMsg));
          return;
        }
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (err) {
          console.error('WRIS JSON parse error:', err.message);
          console.error('Raw WRIS response:', data.substring(0, 500));
          reject(new Error(`Invalid JSON response: ${err.message}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('WRIS request error:', error.message);
      if (retries > 0) {
        console.warn(`Retrying WRIS request, attempts left: ${retries}`);
        setTimeout(() => {
          proxyWRIS(endpoint, params, retries - 1).then(resolve).catch(reject);
        }, 1000);
      } else {
        reject(error);
      }
    });

    req.on('timeout', () => {
      req.destroy();
      const err = new Error('WRIS request timeout - server took too long to respond');
      console.error(err.message);
      if (retries > 0) {
        console.warn(`Retrying WRIS request after timeout, attempts left: ${retries}`);
        setTimeout(() => {
          proxyWRIS(endpoint, params, retries - 1).then(resolve).catch(reject);
        }, 1000);
      } else {
        reject(err);
      }
    });

    req.write(postData);
    req.end();
  });
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'WRIS Proxy Server',
    version: '1.0.0',
    endpoints: [
      'POST /api/wris/rainfall',
      'POST /api/wris/groundwater',
      'POST /api/wris/soil',
      'POST /api/wris/:type (unified)',
      'POST /api/test-location'
    ],
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

async function fetchWRISData(type, stateName, districtName, startdate, enddate) {
  const endpointConfigs = {
    rainfall: {
      endpoint: '/Dataset/RainFall',
      agencyName: 'CWC',
      defaultStartDate: '2023-01-01',
      defaultEndDate: '2024-12-31',
      size: '1000'
    },
    groundwater: {
      endpoint: '/Dataset/Ground%20Water%20Level',
      agencyName: 'CGWB',
      defaultStartDate: '2024-01-01',
      defaultEndDate: '2024-09-29',
      size: '500'
    },
    soil: {
      endpoint: '/Dataset/Soil%20Moisture',
      agencyName: 'NRSC VIC MODEL',
      defaultStartDate: '2024-06-01',
      defaultEndDate: '2024-09-29',
      size: '500'
    }
  };

  if (!endpointConfigs[type]) throw new Error(`Invalid data type: ${type}`);

  const config = endpointConfigs[type];

  return await proxyWRIS(config.endpoint, {
    stateName: stateName.toUpperCase(),
    districtName: districtName.toUpperCase(),
    agencyName: config.agencyName,
    startdate: startdate || config.defaultStartDate,
    enddate: enddate || config.defaultEndDate,
    download: 'false',
    page: '0',
    size: config.size
  });
}

app.post('/api/wris/rainfall', async (req, res) => {
  const { stateName, districtName, startdate, enddate } = req.body;

  if (!stateName || !districtName) {
    return res.status(400).json({
      error: 'Missing required parameters',
      required: ['stateName', 'districtName'],
      received: { stateName: !!stateName, districtName: !!districtName }
    });
  }

  try {
    console.log(`🌧️ Fetching rainfall data for ${stateName}, ${districtName}`);
    const data = await fetchWRISData('rainfall', stateName, districtName, startdate, enddate);
    data.metadata = {
      service: 'WRIS Rainfall',
      location: `${districtName}, ${stateName}`,
      dateRange: `${startdate || '2023-01-01'} to ${enddate || '2024-12-31'}`,
      agency: 'CWC (Central Water Commission)',
      timestamp: new Date().toISOString(),
      source: 'Express Proxy Server'
    };
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Type', 'application/json');
    res.json(data);
  } catch (error) {
    console.error('🌧️ Rainfall proxy error:', error.message);
    res.status(500).json({
      error: error.message,
      service: 'WRIS Rainfall',
      location: `${districtName}, ${stateName}`,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/wris/groundwater', async (req, res) => {
  const { stateName, districtName, startdate, enddate } = req.body;

  if (!stateName || !districtName) {
    return res.status(400).json({
      error: 'Missing required parameters',
      required: ['stateName', 'districtName']
    });
  }

  try {
    console.log(`🌊 Fetching groundwater data for ${stateName}, ${districtName}`);
    const data = await fetchWRISData('groundwater', stateName, districtName, startdate, enddate);
    data.metadata = {
      service: 'WRIS Groundwater',
      location: `${districtName}, ${stateName}`,
      dateRange: `${startdate || '2024-01-01'} to ${enddate || '2024-09-29'}`,
      agency: 'CGWB (Central Ground Water Board)',
      timestamp: new Date().toISOString(),
      source: 'Express Proxy Server'
    };
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Type', 'application/json');
    res.json(data);
  } catch (error) {
    console.error('🌊 Groundwater proxy error:', error.message);
    res.status(500).json({
      error: error.message,
      service: 'WRIS Groundwater',
      location: `${districtName}, ${stateName}`,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/wris/soil', async (req, res) => {
  const { stateName, districtName, startdate, enddate } = req.body;

  if (!stateName || !districtName) {
    return res.status(400).json({
      error: 'Missing required parameters',
      required: ['stateName', 'districtName']
    });
  }

  try {
    console.log(`🌱 Fetching soil moisture data for ${stateName}, ${districtName}`);
    const data = await fetchWRISData('soil', stateName, districtName, startdate, enddate);
    data.metadata = {
      service: 'WRIS Soil Moisture',
      location: `${districtName}, ${stateName}`,
      dateRange: `${startdate || '2024-06-01'} to ${enddate || '2024-09-29'}`,
      agency: 'NRSC VIC MODEL (National Remote Sensing Centre)',
      timestamp: new Date().toISOString(),
      source: 'Express Proxy Server'
    };
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Type', 'application/json');
    res.json(data);
  } catch (error) {
    console.error('🌱 Soil proxy error:', error.message);
    res.status(500).json({
      error: error.message,
      service: 'WRIS Soil Moisture',
      location: `${districtName}, ${stateName}`,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/wris/:type', async (req, res) => {
  const { type } = req.params;
  const { stateName, districtName, startdate, enddate } = req.body;

  if (!stateName || !districtName) {
    return res.status(400).json({
      error: 'Missing required parameters',
      required: ['stateName', 'districtName'],
      received: { stateName: !!stateName, districtName: !!districtName }
    });
  }

  if (!['rainfall', 'groundwater', 'soil'].includes(type)) {
    return res.status(400).json({
      error: 'Invalid endpoint type',
      received: type,
      validTypes: ['rainfall', 'groundwater', 'soil'],
      availableEndpoints: [
        'POST /api/wris/rainfall',
        'POST /api/wris/groundwater',
        'POST /api/wris/soil',
        'POST /api/wris/:type (unified endpoint)'
      ]
    });
  }

  try {
    console.log(`📊 Unified API: Fetching ${type} data for ${stateName}, ${districtName}`);
    const data = await fetchWRISData(type, stateName, districtName, startdate, enddate);

    data.metadata = {
      service: `WRIS ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      location: `${districtName}, ${stateName}`,
      dateRange: `${startdate || ''} to ${enddate || ''}`,
      agency: data.metadata?.agency || '',
      timestamp: new Date().toISOString(),
      source: 'Express Proxy Server',
      endpoint: `/api/wris/${type}`
    };

    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Type', 'application/json');
    res.json(data);
  } catch (error) {
    console.error(`🚨 Unified API ${type} error:`, error.message);
    res.status(500).json({
      error: error.message,
      service: `WRIS ${type}`,
      location: `${districtName}, ${stateName}`,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint for debugging
app.post('/api/test-location', (req, res) => {
  const { coordinates, stateName, districtName } = req.body;

  res.json({
    message: 'WRIS Proxy Server is ready',
    received: { coordinates, stateName, districtName },
    availableEndpoints: [
      'POST /api/wris/rainfall',
      'POST /api/wris/groundwater',
      'POST /api/wris/soil',
      'POST /api/wris/:type (unified)'
    ],
    sampleRequest: {
      stateName: 'MAHARASHTRA',
      districtName: 'AMRAVATI',
      startdate: '2024-01-01',
      enddate: '2024-09-29'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /api/health',
      'POST /api/wris/rainfall',
      'POST /api/wris/groundwater',
      'POST /api/wris/soil',
      'POST /api/wris/:type (unified endpoint)',
      'POST /api/test-location'
    ]
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('🚀 WRIS Proxy Server Started!');
  console.log('='.repeat(50));
  console.log(`🌐 Server listening on port ${PORT}`);
  console.log('📍 Available Endpoints:');
  console.log('   GET  /api/health');
  console.log('   POST /api/wris/rainfall');
  console.log('   POST /api/wris/groundwater');
  console.log('   POST /api/wris/soil');
  console.log('   POST /api/wris/:type (unified endpoint)');
  console.log('   POST /api/test-location');
  console.log('='.repeat(50));
  console.log(`✅ Ready to proxy WRIS APIs for any location in India!`);
  console.log(`📊 Timeout set to ${process.env.WRIS_TIMEOUT || '60000'}ms`);
  console.log(`🌍 CORS enabled for: ${process.env.FRONTEND_URL || 'localhost:3000,localhost:5173'}`);
});
