export interface CategoryVisual {
  emoji: string;
  gradient: string;
  thumbBg: string;
  accent: string;
}

const DEFAULT: CategoryVisual = {
  emoji: '🛒',
  gradient: 'from-slate-100 to-slate-200',
  thumbBg: 'bg-slate-100',
  accent: 'text-slate-600',
};

const BY_CATEGORY_ID: Record<string, CategoryVisual> = {
  'cat-electronics': {
    emoji: '📱',
    gradient: 'from-sky-100 via-blue-50 to-indigo-100',
    thumbBg: 'bg-sky-50',
    accent: 'text-sky-700',
  },
  'cat-fashion': {
    emoji: '👕',
    gradient: 'from-rose-50 via-pink-50 to-fuchsia-100',
    thumbBg: 'bg-rose-50',
    accent: 'text-rose-700',
  },
  'cat-home': {
    emoji: '🏠',
    gradient: 'from-amber-50 via-orange-50 to-yellow-100',
    thumbBg: 'bg-amber-50',
    accent: 'text-amber-800',
  },
};

const BY_SLUG: Record<string, CategoryVisual> = {
  electronics: BY_CATEGORY_ID['cat-electronics'],
  fashion: BY_CATEGORY_ID['cat-fashion'],
  'home-living': BY_CATEGORY_ID['cat-home'],
};

const PRODUCT_EMOJI: Record<string, string> = {
  'pixelbuds-pro': '🎧',
  'smart-watch-x1': '⌚',
  'usb-c-hub-7in1': '🔌',
  'mechanical-keyboard': '⌨️',
  'classic-denim-jacket': '🧥',
  'running-sneakers': '👟',
  'cotton-crew-tee-3pack': '👕',
  'leather-belt': '👔',
  'ceramic-mug-set': '☕',
  'desk-lamp-led': '💡',
  'throw-pillow-pair': '🛋️',
  'wireless-mouse-mini': '🖱️',
  'canvas-tote-bag': '👜',
  'scented-candle-set': '🕯️',
};

export function getCategoryVisual(slugOrId: string): CategoryVisual {
  return BY_SLUG[slugOrId] ?? BY_CATEGORY_ID[slugOrId] ?? DEFAULT;
}

export function getProductEmoji(slug: string, categoryId: string): string {
  return PRODUCT_EMOJI[slug] ?? getCategoryVisual(categoryId).emoji;
}

export function discountPercent(price: number, compareAt: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function savingsAmount(price: number, compareAt: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return compareAt - price;
}
