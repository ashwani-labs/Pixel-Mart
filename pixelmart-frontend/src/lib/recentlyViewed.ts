const STORAGE_KEY = 'pixelmart.recentlyViewed';
const MAX_ITEMS = 12;

export interface RecentlyViewedEntry {
  id: string;
  slug: string;
  name: string;
  viewedAt: number;
}

export function recordRecentlyViewed(product: { id: string; slug: string; name: string }): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentlyViewed().filter((entry) => entry.id !== product.id);
    const next: RecentlyViewedEntry[] = [
      { ...product, viewedAt: Date.now() },
      ...existing,
    ].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota or privacy errors
  }
}

export function getRecentlyViewed(): RecentlyViewedEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentlyViewedEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getRecentlyViewedIds(): string[] {
  return getRecentlyViewed().map((entry) => entry.id);
}
