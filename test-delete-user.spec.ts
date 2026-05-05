import { test, expect } from '@playwright/test';

test('delete user', async ({ page }) => {
  // Login as admin
  await page.goto('http://localhost:3050/admin/login');
  await page.fill('input[type="email"]', 'admin@wafar.com'); // assuming admin@wafar.com
  await page.fill('input[type="password"]', 'admin123'); // assuming admin123
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:3050/admin');
  
  // Go to users page
  await page.goto('http://localhost:3050/admin/users');
  
  // Click delete on the first user
  // We need to wait for users to load
  await page.waitForSelector('table tbody tr');
  
  // click the delete button (third button in the actions cell)
  page.on('dialog', dialog => dialog.accept());
  await page.click('table tbody tr:first-child td:last-child button:last-child');
  
  // wait for response
  const response = await page.waitForResponse(response => response.url().includes('/api/admin/users/') && response.request().method() === 'DELETE');
  console.log('Delete response status:', response.status());
});