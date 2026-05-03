const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3050'; // Frontend URL

(async () => {
  const browser = await chromium.launch({ headless: true, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('--- Starting Auth Flow Test ---');
    
    // 1. Navigate to login
    console.log('Navigating to login page...');
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'networkidle' });
    
    // Check if redirect happens (if already logged in)
    if (!page.url().includes('/login')) {
      console.log('User already logged in. Logging out...');
      await page.goto(`${TARGET_URL}/dashboard`);
      const logoutBtn = await page.locator('button', { hasText: 'تسجيل الخروج' }).first();
      if (await logoutBtn.isVisible()) {
          await logoutBtn.click();
          await page.waitForURL('**/login');
      }
    }

    console.log('On Login Page. URL:', page.url());
    
    // 2. Test Invalid Login
    console.log('Testing invalid login...');
    await page.fill('input[type="tel"]', '0910000000');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Wait for some error message (Assuming toast or inline error appears)
    await page.waitForTimeout(2000); 
    console.log('Invalid login tested.');

    // 3. Navigate to Register
    console.log('Navigating to Register page...');
    await page.click('a[href="/register"]');
    await page.waitForURL('**/register');
    console.log('On Register Page.');

    // 4. Test Registration (Using random phone to avoid conflicts)
    const randomPhone = `091${Math.floor(1000000 + Math.random() * 9000000)}`;
    console.log(`Registering with phone: ${randomPhone}`);
    
    await page.fill('input[type="text"]', 'مستخدم تجريبي');
    await page.fill('input[type="tel"]', randomPhone);
    
    const passwordInputs = await page.locator('input[type="password"]').all();
    if (passwordInputs.length >= 2) {
        await passwordInputs[0].fill('password123');
        await passwordInputs[1].fill('password123');
    }
    
    // Check terms
    await page.check('input[type="checkbox"]#terms');
    
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard or verification
    console.log('Waiting for successful registration redirect...');
    await page.waitForTimeout(5000);
    
    console.log('Current URL after registration:', page.url());
    
    if (page.url().includes('dashboard')) {
        console.log('✅ Registration & Auto-login successful!');
    } else {
        console.log('⚠️ Registration might require verification or failed. Please check logs.');
    }

    await page.screenshot({ path: 'C:/wafar-project/auth-test-result.png', fullPage: true });
    console.log('Screenshot saved to C:/wafar-project/auth-test-result.png');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'C:/wafar-project/auth-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();