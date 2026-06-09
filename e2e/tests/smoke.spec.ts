import { expect, test, type Page } from '@playwright/test';

const CUSTOMER = {
  email: 'customer@pixelmart.local',
  password: 'Customer@123',
};

const ADMIN = {
  email: 'admin@pixelmart.local',
  password: 'Admin@123',
};

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).not.toHaveURL(/\/login$/);
}

async function ensureDeliveryAddress(page: Page) {
  const auth = await page.evaluate(() => {
    const raw = sessionStorage.getItem('pixelmart.auth');
    return raw ? JSON.parse(raw) : null;
  });
  expect(auth?.accessToken).toBeTruthy();

  const existing = await page.request.get('/api/orders/addresses', {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  });
  expect(existing.ok()).toBeTruthy();
  const addresses = (await existing.json()) as unknown[];
  if (addresses.length > 0) {
    return;
  }

  const created = await page.request.post('/api/orders/addresses', {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    data: {
      label: 'Home',
      fullName: 'Test Customer',
      phone: '9999999999',
      addressLine1: '12 Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India',
      isDefault: true,
    },
  });
  expect(created.ok()).toBeTruthy();
}

test('storefront smoke: login, cart, checkout', async ({ page }) => {
  await login(page, CUSTOMER.email, CUSTOMER.password);
  await ensureDeliveryAddress(page);

  await page.goto('/products/classic-denim-jacket');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByText('Added to cart.')).toBeVisible();

  await page.goto('/cart');
  await expect(page.getByText('Classic Denim Jacket')).toBeVisible();
  await page.getByRole('link', { name: 'Proceed to checkout' }).click();

  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  await page.getByRole('button', { name: 'Place mock order' }).click();
  await expect(page).toHaveURL(/\/orders\/[a-f0-9-]+$/i);
  await expect(page.getByText('Order placed successfully.')).toBeVisible();
});

test('admin smoke: audit log is reachable', async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  await page.goto('/admin/audit-log');
  await expect(page.getByRole('heading', { name: 'Audit log' })).toBeVisible();
  await expect(page.getByRole('grid')).toBeVisible();
});
