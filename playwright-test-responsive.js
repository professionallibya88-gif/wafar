const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3050'; // Frontend URL

(async () => {
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  const pathsToTest = ['/login', '/register'];

  for (const viewport of viewports) {
    console.log(`\n--- Testing ${viewport.name} (${viewport.width}x${viewport.height}) ---`);
    
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();

    for (const path of pathsToTest) {
      try {
        console.log(`Testing path: ${path}`);
        await page.goto(`${TARGET_URL}${path}`, { waitUntil: 'networkidle' });
        
        await page.screenshot({
          path: `C:/wafar-project/responsive-${viewport.name.toLowerCase()}-${path.replace('/', '')}.png`,
          fullPage: true,
        });
        console.log(`Screenshot saved for ${path} on ${viewport.name}`);
      } catch (error) {
        console.error(`Error testing ${path} on ${viewport.name}:`, error.message);
      }
    }
    await context.close();
  }

  console.log('\n✅ All viewports tested');
  await browser.close();
})();