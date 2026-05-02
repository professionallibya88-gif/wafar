const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  page.on('response', async response => {
    if (response.url().includes('/api/auth/register')) {
      console.log(`\nAPI Response [${response.status()}]:`, await response.text().catch(e=>'error'));
    }
  });

  try {
    await page.goto('https://wafar-frontend.vercel.app/register', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // In Vue, v-model might not trigger on simple page.fill if it doesn't trigger 'input' event correctly.
    // Let's use type() instead of fill() to simulate real user typing.
    
    await page.locator('input[placeholder="أدخل اسمك الرباعي"]').type('Ahmed Tester'); // fullName
    
    const testPhone = `091${Math.floor(1000000 + Math.random() * 9000000)}`;
    await page.locator('input[placeholder="091XXXXXXX"]').type(testPhone); // phone
    
    await page.locator('input[placeholder="6 أحرف على الأقل"]').type('TestPass123!'); // password
    await page.locator('input[placeholder="أعد كتابة كلمة المرور"]').type('TestPass123!'); // confirmPassword
    
    const termsCheckbox = page.locator('input[type="checkbox"]#terms');
    await termsCheckbox.check({ force: true });
    
    console.log(`Filled form with Name: Ahmed Tester, Phone: ${testPhone}`);
    console.log('Submitting...');
    
    const submitBtn = page.locator('button[type="submit"]');
    const isDisabled = await submitBtn.isDisabled();
    
    if (!isDisabled) {
        await submitBtn.click();
        await page.waitForTimeout(5000); // wait for api response
        console.log('Current URL after submit:', page.url());
    } else {
        console.log('Submit button is still disabled.');
    }

  } catch (err) {
    console.error('Error during testing:', err.message);
  }

  await browser.close();
})();