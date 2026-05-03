const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3050';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'networkidle' });
    
    // Check if we are actually on login page
    const content = await page.content();
    if (content.includes('تسجيل الدخول')) {
      console.log('Login page loaded successfully.');
    } else {
      console.log('Page content:', content.substring(0, 500));
    }
    
    await page.screenshot({ path: 'C:/wafar-project/login-page.png', fullPage: true });
    console.log('Screenshot saved to login-page.png');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
