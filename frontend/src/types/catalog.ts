export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  active: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  effectivePrice: number;
  compareAtPrice: number | null;
  offerName: string | null;
  stockQty: number;
  visible: boolean;
  featured: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProductDetail {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  effectivePrice: number;
  compareAtPrice: number | null;
  offerName: string | null;
  stockQty: number;
  featured: boolean;
  images: ProductImage[];
}

export type OfferType = 'PERCENT' | 'FIXED';
export type OfferScope = 'PRODUCT' | 'CATEGORY' | 'CART';

export interface Offer {
  id: string;
  name: string;
  type: OfferType;
  scope: OfferScope;
  productId: string | null;
  categoryId: string | null;
  value: number;
  startsAt: string;
  endsAt: string | null;
  couponCode: string | null;
  active: boolean;
}

export interface UpsertOfferRequest {
  name: string;
  type: OfferType;
  scope: OfferScope;
  productId?: string | null;
  categoryId?: string | null;
  value: number;
  startsAt: string;
  endsAt?: string | null;
  couponCode?: string | null;
  active?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
