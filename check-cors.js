const https = require('https');

const req = https.request('https://waffer-platform-backend-production.up.railway.app/api/settings/public', {
  method: 'GET',
  headers: {
    'Origin': 'https://wafar-frontend.vercel.app'
  }
}, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
});
req.on('error', console.error);
req.end();
