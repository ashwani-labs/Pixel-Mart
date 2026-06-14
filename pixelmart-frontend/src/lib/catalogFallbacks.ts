import type { Category } from '../types/catalog';

export const FALLBACK_SUPER_CATEGORIES: Pick<Category, 'id' | 'name' | 'slug'>[] = [
  { id: 'super-electronics', name: 'Electronics', slug: 'super-electronics' },
  { id: 'super-fashion', name: 'Fashion', slug: 'super-fashion' },
  { id: 'super-home', name: 'Home & Living', slug: 'super-home' },
  { id: 'super-grocery', name: 'Groceries & Food', slug: 'super-grocery' },
  { id: 'super-beauty', name: 'Beauty & Personal Care', slug: 'super-beauty' },
  { id: 'super-sports', name: 'Sports & Fitness', slug: 'super-sports' },
  { id: 'super-books', name: 'Books & Stationery', slug: 'super-books' },
  { id: 'super-kids', name: 'Kids & Toys', slug: 'super-kids' },
];
