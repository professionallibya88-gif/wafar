const https = require('https');

const checkDBStatus = () => {
  const options = {
    hostname: 'waffer-platform-backend-production.up.railway.app',
    path: '/api/settings/public',
    method: 'GET',
    headers: {
      'Origin': 'https://wafar-frontend.vercel.app'
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => { body += d; });
      res.on('end', () => {
        try {
           const parsed = JSON.parse(body);
           // If it returns success: true, or success: false but with a normal error (not DATABASE_UNAVAILABLE)
           // Settings public route should ideally return 200 and success: true if DB is connected
           if (res.statusCode === 200) {
             resolve(true);
           } else if (parsed.code === 'DATABASE_UNAVAILABLE') {
             resolve(false);
           } else {
             resolve(false); // Wait until it's fully ready
           }
        } catch(e) {
           resolve(false);
        }
      });
    });
    req.on('error', () => resolve(false));
    req.end();
  });
};

async function poll() {
  console.log('Waiting for backend deploy and DB connection to finish...');
  let attempts = 0;
  while (attempts < 60) {
    const success = await checkDBStatus();
    if (success) {
      console.log('\nBackend seems fully up and connected to DB!');
      process.exit(0);
    }
    process.stdout.write('.');
    await new Promise(r => setTimeout(r, 5000));
    attempts++;
  }
  console.log('\nTimeout waiting for deploy/DB connection.');
  process.exit(1);
}

poll();
