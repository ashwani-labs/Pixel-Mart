export interface CategoryVisual {
  emoji: string;
  /** Tailwind gradient classes including dark: variants */
  gradient: string;
  thumbBg: string;
  accent: string;
}

const DEFAULT: CategoryVisual = {
  emoji: '🛒',
  gradient: 'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900',
  thumbBg: 'bg-slate-100 dark:bg-slate-800',
  accent: 'text-slate-600 dark:text-slate-300',
};

function visual(
  emoji: string,
  light: string,
  dark: string,
  thumb: string,
  thumbDark: string,
  accent: string,
  accentDark: string,
): CategoryVisual {
  return {
    emoji,
    gradient: `${light} ${dark}`,
    thumbBg: `${thumb} ${thumbDark}`,
    accent: `${accent} ${accentDark}`,
  };
}

const BY_CATEGORY_ID: Record<string, CategoryVisual> = {
  'super-electronics': visual(
    '📱',
    'from-sky-100 via-blue-50 to-indigo-100',
    'dark:from-sky-950 dark:via-slate-900 dark:to-indigo-950',
    'bg-sky-50',
    'dark:bg-sky-950',
    'text-sky-700',
    'dark:text-sky-300',
  ),
  'super-fashion': visual(
    '👕',
    'from-rose-50 via-pink-50 to-fuchsia-100',
    'dark:from-rose-950 dark:via-slate-900 dark:to-fuchsia-950',
    'bg-rose-50',
    'dark:bg-rose-950',
    'text-rose-700',
    'dark:text-rose-300',
  ),
  'super-home': visual(
    '🏠',
    'from-amber-50 via-orange-50 to-yellow-100',
    'dark:from-amber-950 dark:via-slate-900 dark:to-orange-950',
    'bg-amber-50',
    'dark:bg-amber-950',
    'text-amber-800',
    'dark:text-amber-300',
  ),
  'super-grocery': visual(
    '🛒',
    'from-lime-50 via-green-50 to-emerald-100',
    'dark:from-lime-950 dark:via-slate-900 dark:to-emerald-950',
    'bg-lime-50',
    'dark:bg-lime-950',
    'text-green-800',
    'dark:text-green-300',
  ),
  'super-beauty': visual(
    '💄',
    'from-fuchsia-50 via-pink-50 to-rose-100',
    'dark:from-fuchsia-950 dark:via-slate-900 dark:to-rose-950',
    'bg-fuchsia-50',
    'dark:bg-fuchsia-950',
    'text-fuchsia-800',
    'dark:text-fuchsia-300',
  ),
  'super-sports': visual(
    '⚽',
    'from-teal-50 via-cyan-50 to-sky-100',
    'dark:from-teal-950 dark:via-slate-900 dark:to-cyan-950',
    'bg-teal-50',
    'dark:bg-teal-950',
    'text-teal-800',
    'dark:text-teal-300',
  ),
  'super-books': visual(
    '📚',
    'from-violet-50 via-purple-50 to-indigo-100',
    'dark:from-violet-950 dark:via-slate-900 dark:to-indigo-950',
    'bg-violet-50',
    'dark:bg-violet-950',
    'text-violet-800',
    'dark:text-violet-300',
  ),
  'super-kids': visual(
    '🧸',
    'from-yellow-50 via-amber-50 to-orange-100',
    'dark:from-yellow-950 dark:via-slate-900 dark:to-orange-950',
    'bg-yellow-50',
    'dark:bg-yellow-950',
    'text-amber-900',
    'dark:text-amber-300',
  ),
  'cat-electronics': visual(
    '📱',
    'from-sky-100 via-blue-50 to-indigo-100',
    'dark:from-sky-950 dark:via-slate-900 dark:to-indigo-950',
    'bg-sky-50',
    'dark:bg-sky-950',
    'text-sky-700',
    'dark:text-sky-300',
  ),
  'cat-fashion': visual(
    '👕',
    'from-rose-50 via-pink-50 to-fuchsia-100',
    'dark:from-rose-950 dark:via-slate-900 dark:to-fuchsia-950',
    'bg-rose-50',
    'dark:bg-rose-950',
    'text-rose-700',
    'dark:text-rose-300',
  ),
  'cat-home': visual(
    '🏠',
    'from-amber-50 via-orange-50 to-yellow-100',
    'dark:from-amber-950 dark:via-slate-900 dark:to-orange-950',
    'bg-amber-50',
    'dark:bg-amber-950',
    'text-amber-800',
    'dark:text-amber-300',
  ),
  'cat-staples': visual(
    '🍚',
    'from-lime-50 via-green-50 to-emerald-100',
    'dark:from-lime-950 dark:via-slate-900 dark:to-emerald-950',
    'bg-lime-50',
    'dark:bg-lime-950',
    'text-green-800',
    'dark:text-green-300',
  ),
  'cat-snacks': visual(
    '🍪',
    'from-orange-50 via-amber-50 to-yellow-100',
    'dark:from-orange-950 dark:via-slate-900 dark:to-amber-950',
    'bg-orange-50',
    'dark:bg-orange-950',
    'text-orange-800',
    'dark:text-orange-300',
  ),
  'cat-skincare': visual(
    '✨',
    'from-fuchsia-50 via-pink-50 to-rose-100',
    'dark:from-fuchsia-950 dark:via-slate-900 dark:to-rose-950',
    'bg-fuchsia-50',
    'dark:bg-fuchsia-950',
    'text-fuchsia-800',
    'dark:text-fuchsia-300',
  ),
  'cat-toys': visual(
    '🎮',
    'from-yellow-50 via-amber-50 to-orange-100',
    'dark:from-yellow-950 dark:via-slate-900 dark:to-orange-950',
    'bg-yellow-50',
    'dark:bg-yellow-950',
    'text-amber-900',
    'dark:text-amber-300',
  ),
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
  footwear: BY_CATEGORY_ID['cat-fashion'],
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
