const { proxyWRIS } = require('../proxyHelpers');

// CORS helper function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 hours
};

module.exports = async (req, res) => {
  // Set CORS headers for all responses
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    }));
  }

  try {
    // Parse request body for Vercel
    let body;
    if (req.body) {
      body = req.body;
    } else {
      // Fallback for raw body
      body = JSON.parse(req);
    }

    const { stateName, districtName, startdate, enddate } = body;

    if (!stateName || !districtName) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        error: 'Missing required parameters',
        message: 'stateName and districtName are required',
        received: { stateName: !!stateName, districtName: !!districtName }
      }));
    }

    console.log(`🌧️ Vercel: Processing rainfall request for ${stateName}, ${districtName}`);

    const data = await proxyWRIS('/Dataset/RainFall', {
      stateName: stateName.toUpperCase(),
      districtName: districtName.toUpperCase(),
      agencyName: 'CWC',
      startdate: startdate || '2023-01-01',
      enddate: enddate || '2024-12-31',
      download: 'false',
      page: '0',
      size: '1000',
    });

    // Add metadata
    data.metadata = {
      service: 'WRIS Rainfall',
      location: `${districtName}, ${stateName}`,
      dateRange: `${startdate || '2023-01-01'} to ${enddate || '2024-12-31'}`,
      agency: 'CWC (Central Water Commission)',
      timestamp: new Date().toISOString(),
      source: 'Vercel Serverless Function'
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.end(JSON.stringify(data));

  } catch (error) {
    console.error('🌧️ Vercel rainfall API error:', error);

    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    }));
  }
};
