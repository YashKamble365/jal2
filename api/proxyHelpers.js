const https = require('https');
const querystring = require('querystring');

function proxyWRIS(endpoint, params) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Vercel: Proxying WRIS ${endpoint} for ${params.stateName}, ${params.districtName}`);

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
      }
    };

    const startTime = Date.now();
    const req = https.request(options, (res) => {
      let data = '';

      res.setEncoding('utf8');
      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        console.log(`✅ Vercel: WRIS ${endpoint} responded in ${responseTime}ms`);

        try {
          // Handle different response formats
          let jsonData;
          if (typeof data === 'string') {
            jsonData = JSON.parse(data);
          } else {
            jsonData = data;
          }

          console.log(`📊 Vercel: ${params.stateName}/${params.districtName}: Status ${jsonData.statusCode} - ${jsonData.data?.length || 0} records`);

          if (jsonData.statusCode === 200) {
            resolve(jsonData);
          } else {
            resolve({
              statusCode: jsonData.statusCode || 500,
              message: jsonData.message || 'No data available',
              data: jsonData.data || [],
              error: 'WRIS API returned error status'
            });
          }
        } catch (error) {
          console.error(`❌ Vercel: JSON parse error for ${endpoint}:`, error.message);
          console.error(`❌ Vercel: Raw response:`, data.substring(0, 500));
          reject(new Error(`Invalid JSON response from WRIS: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      console.error(`❌ Vercel: WRIS ${endpoint} failed for ${params.stateName}/${params.districtName} after ${responseTime}ms:`, error.message);
      reject(new Error(`WRIS connection failed: ${error.message}`));
    });

    req.setTimeout(parseInt(process.env.WRIS_TIMEOUT || '30000'), () => {
      console.error(`⏰ Vercel: WRIS ${endpoint} timeout for ${params.stateName}/${params.districtName}`);
      req.destroy();
      reject(new Error('WRIS request timeout - server took too long to respond'));
    });

    // Ensure we write the data
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

module.exports = { proxyWRIS };
