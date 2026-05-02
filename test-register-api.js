const https = require('https');

const data = JSON.stringify({
  full_name: 'Test Playwright Final',
  phone: `091${Math.floor(1000000 + Math.random() * 9000000)}`,
  password: 'Password123!',
  confirm_password: 'Password123!'
});

const options = {
  hostname: 'waffer-platform-backend-production.up.railway.app',
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  
  let body = '';
  res.on('data', d => {
    body += d;
  });
  
  res.on('end', () => {
    console.log('RESPONSE:', body);
  });
});

req.on('error', error => {
  console.error('ERROR:', error);
});

req.write(data);
req.end();