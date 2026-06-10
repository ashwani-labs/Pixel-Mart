import { expect, test } from '@playwright/test';
import path from 'node:path';

const SCREENSHOT_DIR = path.resolve(__dirname, '../../docs/screenshots');

test.describe('portfolio screenshots', () => {
  test('capture storefront and admin views', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Welcome to the store' })).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-home.png'), fullPage: true });

    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Shop all products' })).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-product-list.png'), fullPage: true });

    await page.goto('/products/classic-denim-jacket');
    await expect(page.getByRole('heading', { name: 'Classic Denim Jacket' })).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-product-detail.png'), fullPage: true });

    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@pixelmart.local');
    await page.getByLabel('Password').fill('Admin@123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).not.toHaveURL(/\/login$/);

    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-admin-dashboard.png'), fullPage: true });

    await page.goto('/admin/audit-log');
    await expect(page.getByRole('heading', { name: 'Audit log' })).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-admin-audit-log.png'), fullPage: true });
  });
});
