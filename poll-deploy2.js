const https = require('https');

const checkDeployment = () => {
  const options = {
    hostname: 'waffer-platform-backend-production.up.railway.app',
    path: '/api/settings/public',
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://wafar-frontend.vercel.app',
      'Access-Control-Request-Method': 'GET'
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      // Check if it's 200/204 or at least not 502 anymore
      if (res.statusCode !== 502) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    req.on('error', () => resolve(false));
    req.end();
  });
};

async function poll() {
  console.log('Waiting for backend deploy to finish...');
  let attempts = 0;
  while (attempts < 60) {
    const success = await checkDeployment();
    if (success) {
      console.log('\nBackend seems up (Not returning 502 anymore).');
      process.exit(0);
    }
    process.stdout.write('.');
    await new Promise(r => setTimeout(r, 5000));
    attempts++;
  }
  console.log('\nTimeout waiting for deploy.');
  process.exit(1);
}

poll();
