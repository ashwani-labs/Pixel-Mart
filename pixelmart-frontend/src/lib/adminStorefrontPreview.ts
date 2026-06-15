export const ADMIN_STOREFRONT_PREVIEW_KEY = 'adminStorefrontPreview';

export function enableAdminStorefrontPreview() {
  sessionStorage.setItem(ADMIN_STOREFRONT_PREVIEW_KEY, '1');
}

export function clearAdminStorefrontPreview() {
  sessionStorage.removeItem(ADMIN_STOREFRONT_PREVIEW_KEY);
}

export function isAdminStorefrontPreviewEnabled() {
  return sessionStorage.getItem(ADMIN_STOREFRONT_PREVIEW_KEY) === '1';
}
