const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3051/admin/login');
  await page.fill('input[type="text"]', '0911111111');
  await page.fill('input[type="password"]', 'admin1234');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log("Current URL:", page.url());
  
  await page.goto('http://localhost:3051/admin/support-channels');
  await page.waitForTimeout(2000);
  console.log("Channels URL:", page.url());
  
  await browser.close();
})();
