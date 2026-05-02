const http = require('https');

function checkEndpoint() {
  const options = {
    hostname: 'waffer-platform-backend-production.up.railway.app',
    path: '/api/settings/public',
    method: 'OPTIONS', // Check CORS preflight
    headers: {
      'Origin': 'https://wafar-frontend.vercel.app',
      'Access-Control-Request-Method': 'GET'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      if (res.headers['access-control-allow-origin'] === 'https://wafar-frontend.vercel.app' || 
          res.headers['access-control-allow-origin'] === '*') {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on('error', (e) => {
      resolve(false);
    });

    req.end();
  });
}

async function poll() {
  console.log('Waiting for Railway deploy to finish and CORS to be updated...');
  let attempts = 0;
  while (attempts < 60) {
    const success = await checkEndpoint();
    if (success) {
      console.log('\nDeploy successful! CORS is now allowing requests from frontend.');
      process.exit(0);
    }
    process.stdout.write('.');
    await new Promise(r => setTimeout(r, 5000)); // wait 5 seconds
    attempts++;
  }
  console.log('\nTimeout waiting for deploy.');
  process.exit(1);
}

poll();
