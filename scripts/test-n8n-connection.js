// Simple n8n API test without dependencies
const https = require('https');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MzdkNmI0OC1iMTk0LTQ5ZDYtODRhMC1mZDgyMjVhNGU3YmMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTQzMzE5fQ.dl1wfBcqdP-PUEqQQFJhNssFLEWtKAAKxAllEySsMOo';
const BASE_URL = 'raddirectdrive.app.n8n.cloud';

const options = {
  hostname: BASE_URL,
  port: 443,
  path: '/api/v1/workflows',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Accept': 'application/json'
  }
};

console.log('🔍 Testing n8n cloud connection...');
console.log(`📡 Connecting to: ${BASE_URL}`);

const req = https.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      if (res.statusCode === 200) {
        const workflows = JSON.parse(data);
        console.log(`✅ Connection successful!`);
        console.log(`📋 Found ${workflows.data?.length || 0} workflows:`);
        
        if (workflows.data) {
          workflows.data.forEach((wf, i) => {
            console.log(`${i + 1}. ${wf.name} (${wf.active ? 'Active' : 'Inactive'})`);
          });
        }
      } else {
        console.log(`❌ Error ${res.statusCode}:`, data);
      }
    } catch (e) {
      console.log('❌ Parse error:', e.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Connection error:', err.message);
});

req.end();