const https = require('https');

const checkDBStatus = () => {
  const options = {
    hostname: 'waffer-platform-backend-production.up.railway.app',
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => { body += d; });
      res.on('end', () => {
        try {
           const parsed = JSON.parse(body);
           if (parsed.code !== 'DATABASE_UNAVAILABLE') {
             resolve(true);
           } else {
             resolve(false);
           }
        } catch(e) {
           resolve(false);
        }
      });
    });
    req.on('error', () => resolve(false));
    req.write(JSON.stringify({
      full_name: 'Test',
      phone: '0912345678',
      password: 'test',
      confirm_password: 'test'
    }));
    req.end();
  });
};

async function poll() {
  console.log('Waiting for backend DB connection for auth to be fully ready...');
  let attempts = 0;
  while (attempts < 60) {
    const success = await checkDBStatus();
    if (success) {
      console.log('\nAuth endpoint not returning DATABASE_UNAVAILABLE anymore!');
      process.exit(0);
    }
    process.stdout.write('.');
    await new Promise(r => setTimeout(r, 5000));
    attempts++;
  }
  console.log('\nTimeout waiting for DB connection.');
  process.exit(1);
}

poll();