import { useEffect, useState } from 'react';

export interface GuestCartItem {
  productId: string;
  productName: string;
  productSlug: string;
  unitPrice: number;
  quantity: number;
}

const STORAGE_KEY = 'pixelmart_guest_cart';

function readRaw(): GuestCartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: GuestCartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('pixelmart-guest-cart-updated'));
}

export function getGuestCart(): GuestCartItem[] {
  return readRaw();
}

export function clearGuestCart() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('pixelmart-guest-cart-updated'));
}

export function guestCartSummary(items: GuestCartItem[]) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  return { itemCount: items.length, totalQuantity, subtotal };
}

export function addGuestCartItem(item: Omit<GuestCartItem, 'quantity'>, quantity = 1): GuestCartItem[] {
  const items = readRaw();
  const existing = items.find((entry) => entry.productId === item.productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ ...item, quantity });
  }
  write(items);
  return items;
}

export function updateGuestCartQuantity(productId: string, quantity: number): GuestCartItem[] {
  const items = readRaw();
  const next = items
    .map((item) => (item.productId === productId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);
  write(next);
  return next;
}

export function removeGuestCartItem(productId: string): GuestCartItem[] {
  const next = readRaw().filter((item) => item.productId !== productId);
  write(next);
  return next;
}

export function useGuestCartTotalQuantity(): number {
  const [total, setTotal] = useState(() => guestCartSummary(getGuestCart()).totalQuantity);

  useEffect(() => {
    const sync = () => setTotal(guestCartSummary(getGuestCart()).totalQuantity);
    window.addEventListener('pixelmart-guest-cart-updated', sync);
    return () => window.removeEventListener('pixelmart-guest-cart-updated', sync);
  }, []);

  return total;
}
