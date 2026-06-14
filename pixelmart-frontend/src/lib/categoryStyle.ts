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
  'super-electronics': {
    emoji: '📱',
    gradient: 'from-sky-100 via-blue-50 to-indigo-100',
    thumbBg: 'bg-sky-50',
    accent: 'text-sky-700',
  },
  'super-fashion': {
    emoji: '👕',
    gradient: 'from-rose-50 via-pink-50 to-fuchsia-100',
    thumbBg: 'bg-rose-50',
    accent: 'text-rose-700',
  },
  'super-home': {
    emoji: '🏠',
    gradient: 'from-amber-50 via-orange-50 to-yellow-100',
    thumbBg: 'bg-amber-50',
    accent: 'text-amber-800',
  },
  'super-grocery': {
    emoji: '🛒',
    gradient: 'from-lime-50 via-green-50 to-emerald-100',
    thumbBg: 'bg-lime-50',
    accent: 'text-green-800',
  },
  'super-beauty': {
    emoji: '💄',
    gradient: 'from-fuchsia-50 via-pink-50 to-rose-100',
    thumbBg: 'bg-fuchsia-50',
    accent: 'text-fuchsia-800',
  },
  'super-sports': {
    emoji: '⚽',
    gradient: 'from-teal-50 via-cyan-50 to-sky-100',
    thumbBg: 'bg-teal-50',
    accent: 'text-teal-800',
  },
  'super-books': {
    emoji: '📚',
    gradient: 'from-violet-50 via-purple-50 to-indigo-100',
    thumbBg: 'bg-violet-50',
    accent: 'text-violet-800',
  },
  'super-kids': {
    emoji: '🧸',
    gradient: 'from-yellow-50 via-amber-50 to-orange-100',
    thumbBg: 'bg-yellow-50',
    accent: 'text-amber-900',
  },
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
  'cat-staples': {
    emoji: '🍚',
    gradient: 'from-lime-50 via-green-50 to-emerald-100',
    thumbBg: 'bg-lime-50',
    accent: 'text-green-800',
  },
  'cat-snacks': {
    emoji: '🍪',
    gradient: 'from-orange-50 via-amber-50 to-yellow-100',
    thumbBg: 'bg-orange-50',
    accent: 'text-orange-800',
  },
  'cat-skincare': {
    emoji: '✨',
    gradient: 'from-fuchsia-50 via-pink-50 to-rose-100',
    thumbBg: 'bg-fuchsia-50',
    accent: 'text-fuchsia-800',
  },
  'cat-toys': {
    emoji: '🎮',
    gradient: 'from-yellow-50 via-amber-50 to-orange-100',
    thumbBg: 'bg-yellow-50',
    accent: 'text-amber-900',
  },
};

const BY_SLUG: Record<string, CategoryVisual> = {
  'super-electronics': BY_CATEGORY_ID['super-electronics'],
  'super-fashion': BY_CATEGORY_ID['super-fashion'],
  'super-home': BY_CATEGORY_ID['super-home'],
  'super-grocery': BY_CATEGORY_ID['super-grocery'],
  'super-beauty': BY_CATEGORY_ID['super-beauty'],
  'super-sports': BY_CATEGORY_ID['super-sports'],
  'super-books': BY_CATEGORY_ID['super-books'],
  'super-kids': BY_CATEGORY_ID['super-kids'],
  electronics: BY_CATEGORY_ID['cat-electronics'],
  clothing: BY_CATEGORY_ID['cat-fashion'],
  footwear: BY_CATEGORY_ID['cat-footwear'],
  'home-decor': BY_CATEGORY_ID['cat-home'],
  staples: BY_CATEGORY_ID['cat-staples'],
  'snacks-biscuits': BY_CATEGORY_ID['cat-snacks'],
  'skin-care': BY_CATEGORY_ID['cat-skincare'],
  'toys-games': BY_CATEGORY_ID['cat-toys'],
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
  'pixelphone-14': '📱',
  'basmati-rice-5kg': '🍚',
  'vitamin-c-serum': '✨',
  'yoga-mat-6mm': '🧘',
  'atomic-habits-paperback': '📖',
  'building-blocks-100pc': '🧱',
  'nonstick-cookware-5pc': '🍳',
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
