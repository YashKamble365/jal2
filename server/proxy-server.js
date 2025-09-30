// server/proxy-server.js
const express = require('express');
const cors = require('cors');
const https = require('https');
const querystring = require('querystring');
require('dotenv').config();

const app = express();

// CORS configuration for your React app
app.use(cors({
  origin: [
    'http://localhost:3000',    // Create React App default
    'http://localhost:5173',    // Vite default
    'http://localhost:4173',    // Vite preview
    process.env.FRONTEND_URL    // Production URL from .env
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.body) {
    console.log(`📍 Request for: ${req.body.stateName}/${req.body.districtName}`);
  }
  next();
});

// Generic WRIS proxy function
async function proxyWRIS(endpoint, params) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Proxying WRIS ${endpoint} for ${params.stateName}, ${params.districtName}`);
    
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
        'User-Agent': 'Mozilla/5.0 (compatible; AquaPlan/1.0)'
      }
    };
    
    const startTime = Date.now();
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        console.log(`✅ WRIS ${endpoint} responded in ${responseTime}ms`);
        
        try {
          const jsonData = JSON.parse(data);
          console.log(`📊 ${params.stateName}/${params.districtName}: Status ${jsonData.statusCode} - ${jsonData.data?.length || 0} records`);
          
          if (jsonData.statusCode === 200) {
            resolve(jsonData);
          } else {
            resolve({
              statusCode: jsonData.statusCode || 500,
              message: jsonData.message || 'No data available',
              data: [],
              error: 'WRIS API returned error status'
            });
          }
        } catch (error) {
          console.error(`❌ JSON parse error for ${endpoint}:`, error.message);
          reject(new Error('Invalid JSON response from WRIS'));
        }
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      console.error(`❌ WRIS ${endpoint} failed for ${params.stateName}/${params.districtName} after ${responseTime}ms:`, error.message);
      reject(new Error(`WRIS connection failed: ${error.message}`));
    });
    
    req.setTimeout(parseInt(process.env.WRIS_TIMEOUT || '30000'), () => {
      console.error(`⏰ WRIS ${endpoint} timeout for ${params.stateName}/${params.districtName}`);
      req.destroy();
      reject(new Error('WRIS request timeout - server took too long to respond'));
    });
    
    req.write(postData);
    req.end();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'WRIS Proxy Server',
    version: '1.0.0',
    endpoints: [
      'POST /api/wris/rainfall',
      'POST /api/wris/groundwater', 
      'POST /api/wris/soil'
    ],
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// DYNAMIC Rainfall proxy
app.post('/api/wris/rainfall', async (req, res) => {
  try {
    const { stateName, districtName, startdate, enddate } = req.body;
    
    // Validate required parameters
    if (!stateName || !districtName) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['stateName', 'districtName'],
        received: { stateName: !!stateName, districtName: !!districtName }
      });
    }
    
    console.log(`🌧️ Fetching rainfall data for ${stateName}, ${districtName}`);
    
    const data = await proxyWRIS('/Dataset/RainFall', {
      stateName: stateName.toUpperCase(),
      districtName: districtName.toUpperCase(),
      agencyName: 'CWC',
      startdate: startdate || '2023-01-01',
      enddate: enddate || '2024-12-31',
      download: 'false',
      page: '0',
      size: '1000'
    });
    
    // Add metadata for frontend
    data.metadata = {
      service: 'WRIS Rainfall',
      location: `${districtName}, ${stateName}`,
      dateRange: `${startdate || '2023-01-01'} to ${enddate || '2024-12-31'}`,
      agency: 'CWC (Central Water Commission)',
      timestamp: new Date().toISOString()
    };
    
    res.json(data);
    
  } catch (error) {
    console.error('🌧️ Rainfall proxy error:', error.message);
    res.status(500).json({ 
      error: error.message,
      service: 'WRIS Rainfall',
      location: `${req.body.districtName}, ${req.body.stateName}`,
      timestamp: new Date().toISOString()
    });
  }
});

// DYNAMIC Groundwater proxy  
app.post('/api/wris/groundwater', async (req, res) => {
  try {
    const { stateName, districtName, startdate, enddate } = req.body;
    
    if (!stateName || !districtName) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['stateName', 'districtName']
      });
    }
    
    console.log(`🌊 Fetching groundwater data for ${stateName}, ${districtName}`);
    
    const data = await proxyWRIS('/Dataset/Ground%20Water%20Level', {
      stateName: stateName.toUpperCase(),
      districtName: districtName.toUpperCase(),
      agencyName: 'CGWB',
      startdate: startdate || '2024-01-01',
      enddate: enddate || '2024-09-29',
      download: 'false',
      page: '0',
      size: '500'
    });
    
    data.metadata = {
      service: 'WRIS Groundwater',
      location: `${districtName}, ${stateName}`,
      dateRange: `${startdate || '2024-01-01'} to ${enddate || '2024-09-29'}`,
      agency: 'CGWB (Central Ground Water Board)',
      timestamp: new Date().toISOString()
    };
    
    res.json(data);
    
  } catch (error) {
    console.error('🌊 Groundwater proxy error:', error.message);
    res.status(500).json({ 
      error: error.message,
      service: 'WRIS Groundwater',
      location: `${req.body.districtName}, ${req.body.stateName}`,
      timestamp: new Date().toISOString()
    });
  }
});

// DYNAMIC Soil proxy
app.post('/api/wris/soil', async (req, res) => {
  try {
    const { stateName, districtName, startdate, enddate } = req.body;
    
    if (!stateName || !districtName) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['stateName', 'districtName']
      });
    }
    
    console.log(`🌱 Fetching soil moisture data for ${stateName}, ${districtName}`);
    
    const data = await proxyWRIS('/Dataset/Soil%20Moisture', {
      stateName: stateName.toUpperCase(),
      districtName: districtName.toUpperCase(),
      agencyName: 'NRSC VIC MODEL', // Confirmed working from your tests
      startdate: startdate || '2024-06-01',
      enddate: enddate || '2024-09-29',
      download: 'false',
      page: '0',
      size: '500'
    });
    
    data.metadata = {
      service: 'WRIS Soil Moisture',
      location: `${districtName}, ${stateName}`,
      dateRange: `${startdate || '2024-06-01'} to ${enddate || '2024-09-29'}`,
      agency: 'NRSC VIC MODEL (National Remote Sensing Centre)',
      timestamp: new Date().toISOString()
    };
    
    res.json(data);
    
  } catch (error) {
    console.error('🌱 Soil proxy error:', error.message);
    res.status(500).json({ 
      error: error.message,
      service: 'WRIS Soil Moisture',
      location: `${req.body.districtName}, ${req.body.stateName}`,
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
      'POST /api/wris/soil'
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
      'POST /api/wris/soil'
    ]
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('🚀 WRIS Proxy Server Started!');
  console.log('=' .repeat(50));
  console.log(`🌐 Server: http://${HOST}:${PORT}`);
  console.log('📍 Endpoints:');
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/wris/rainfall`);
  console.log(`   POST /api/wris/groundwater`);
  console.log(`   POST /api/wris/soil`);
  console.log('=' .repeat(50));
  console.log('✅ Ready to proxy WRIS APIs for any location in India!');
  console.log(`📊 Timeout: ${process.env.WRIS_TIMEOUT || '30000'}ms`);
  console.log(`🌍 CORS enabled for: ${process.env.FRONTEND_URL || 'localhost:3000,localhost:5173'}`);
});
