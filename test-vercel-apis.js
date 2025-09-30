#!/usr/bin/env node

/**
 * Test script for Vercel-deployed WRIS APIs
 * Run this after deployment to verify APIs are working
 */

const https = require('https');

const TEST_LOCATION = {
  stateName: 'MAHARASHTRA',
  districtName: 'AMRAVATI'
};

async function testAPI(endpoint, name) {
  return new Promise((resolve, reject) => {
    console.log(`🧪 Testing ${name}...`);

    const postData = JSON.stringify(TEST_LOCATION);

    const options = {
      hostname: 'your-deployment-url.vercel.app', // Replace with your actual Vercel URL
      port: 443,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Vercel-API-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ ${name}: Status ${res.statusCode}`);
          console.log(`📊 Records: ${response.data?.length || 0}`);
          console.log(`🏷️ Source: ${response.metadata?.source || 'Unknown'}`);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          console.error(`❌ ${name}: Failed to parse response`);
          resolve({ status: res.statusCode, error: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ ${name}: Request failed - ${error.message}`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Vercel API Tests...\n');

  try {
    // Test all three APIs
    const rainfall = await testAPI('/api/wris/rainfall', 'Rainfall API');
    console.log('');

    const groundwater = await testAPI('/api/wris/groundwater', 'Groundwater API');
    console.log('');

    const soil = await testAPI('/api/wris/soil', 'Soil Moisture API');
    console.log('');

    // Summary
    console.log('📋 Test Summary:');
    console.log(`🌧️ Rainfall: ${rainfall.status === 200 ? '✅' : '❌'}`);
    console.log(`🌊 Groundwater: ${groundwater.status === 200 ? '✅' : '❌'}`);
    console.log(`🌱 Soil: ${soil.status === 200 ? '✅' : '❌'}`);

    const allPassed = [rainfall, groundwater, soil].every(test => test.status === 200);
    console.log(`\n${allPassed ? '🎉' : '⚠️'} Overall: ${allPassed ? 'All tests passed!' : 'Some tests failed'}`);

  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

// Instructions
console.log(`
🔧 Setup Instructions:
1. Replace 'your-deployment-url.vercel.app' with your actual Vercel deployment URL
2. Run: node test-vercel-apis.js

📝 Example Vercel URLs:
- https://your-project-name.vercel.app
- https://your-project-name-git-main-your-username.vercel.app

`);

// Uncomment to run tests
// runTests();

module.exports = { testAPI, runTests };
