const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3050'; // Frontend URL

(async () => {
  const browser = await chromium.launch({ headless: true, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('--- Starting Cart & Orders Flow Test ---');
    
    // 1. Navigate and login
    console.log('Navigating to login page...');
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'networkidle' });
    
    // Use a pre-existing user or create a new login context
    // We will use a typical test user assuming 0910000000 or admin is available
    await page.fill('input[type="tel"]', '0910000000'); // Note: Replace with valid user phone if needed
    await page.fill('input[type="password"]', 'password123'); // Note: Replace with valid password
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    // 2. Go to Search / Catalogs
    console.log('Navigating to Search page...');
    await page.goto(`${TARGET_URL}/search`, { waitUntil: 'networkidle' });
    
    // 3. Try to add to cart
    console.log('Attempting to add items to cart...');
    const addToCartButtons = await page.locator('button', { hasText: 'أضف' }).all();
    if (addToCartButtons.length > 0) {
        await addToCartButtons[0].click();
        console.log('Clicked Add to Cart button.');
    } else {
        console.log('No items found to add to cart. Skipping add to cart step.');
    }
    
    await page.waitForTimeout(2000);

    // 4. Go to Cart page
    console.log('Navigating to Cart page...');
    await page.goto(`${TARGET_URL}/cart`, { waitUntil: 'networkidle' });
    
    await page.screenshot({ path: 'C:/wafar-project/cart-test-result.png', fullPage: true });
    console.log('Screenshot saved to C:/wafar-project/cart-test-result.png');

    // 5. Checkout (if items exist)
    const checkoutBtn = await page.locator('button', { hasText: 'إتمام الطلب' }).first();
    if (await checkoutBtn.isVisible()) {
        console.log('Clicking Checkout...');
        await checkoutBtn.click();
        await page.waitForTimeout(3000);
        console.log('Checkout completed.');
    } else {
        console.log('Cart is empty, checkout not available.');
    }

    // 6. Go to My Orders
    console.log('Navigating to My Orders...');
    await page.goto(`${TARGET_URL}/my-orders`, { waitUntil: 'networkidle' });
    
    await page.screenshot({ path: 'C:/wafar-project/orders-test-result.png', fullPage: true });
    console.log('Screenshot saved to C:/wafar-project/orders-test-result.png');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'C:/wafar-project/cart-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();