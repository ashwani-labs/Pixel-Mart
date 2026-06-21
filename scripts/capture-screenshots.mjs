import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'docs', 'screenshots');
const baseUrl = 'http://localhost:5173';
const productSlug = process.argv[2] ?? 'adjustable-dumbbell-pair';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

async function capture(name, url, setup) {
  await page.goto(url, { waitUntil: 'networkidle' });
  if (setup) await setup();
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(outDir, `${name}.png`),
    fullPage: false,
  });
  console.log(`Saved ${name}.png`);
}

await capture('storefront-home', `${baseUrl}/`);
await capture('product-detail', `${baseUrl}/products/${productSlug}`);

await page.goto(`${baseUrl}/admin-login`, { waitUntil: 'networkidle' });
await page.getByLabel(/email/i).fill('admin@pixelmart.local');
await page.getByLabel(/password/i).fill('Admin@123');
await page.getByRole('button', { name: /sign in|log in|login/i }).click();
await page.waitForURL(/\/admin(\/)?$/, { timeout: 15000 });
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2500);
await page.screenshot({
  path: path.join(outDir, 'admin-dashboard.png'),
  fullPage: false,
});
console.log('Saved admin-dashboard.png');

await browser.close();
