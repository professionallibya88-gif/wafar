const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Testing Admin Login and Support Tickets...');
  
  // Login as admin
  await page.goto('http://localhost:3050/admin/login');
  await page.fill('input[type="email"]', 'admin@waffer.local');
  await page.fill('input[type="password"]', 'Admin123!@#');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('http://localhost:3050/admin');
  console.log('Logged in to Admin Dashboard successfully.');

  // Navigate to Support Tickets
  await page.goto('http://localhost:3050/admin/support-tickets');
  await page.waitForSelector('text=تذاكر الدعم والمراسلات');
  console.log('Navigated to Support Tickets successfully.');
  
  // Now test user widget
  console.log('Testing User Widget...');
  const userContext = await browser.newContext();
  const userPage = await userContext.newPage();
  
  await userPage.goto('http://localhost:3050/');
  await userPage.waitForSelector('.support-widget button');
  console.log('Widget button found on homepage.');
  
  await userPage.click('.support-widget button');
  await userPage.waitForSelector('text=تواصل معنا');
  console.log('Widget opened successfully.');

  await browser.close();
  console.log('All tests passed!');
})();
