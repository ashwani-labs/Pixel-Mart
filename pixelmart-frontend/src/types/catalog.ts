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

export interface ProductHighlight {
  label: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  sku: string | null;
  label: string;
  size: string | null;
  color: string | null;
  price: number;
  stockQty: number;
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
  highlights: ProductHighlight[];
  variants: ProductVariant[];
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

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ReviewImage {
  id: string;
  url: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string | null;
  reviewerName: string;
  rating: number;
  title: string | null;
  body: string;
  status: ReviewStatus;
  verifiedPurchase: boolean;
  createdAt: string;
  images: ReviewImage[];
}

export interface SubmitReviewRequest {
  productId: string;
  rating: number;
  title?: string;
  body: string;
  images?: File[];
}

export interface BulkStockItem {
  productId: string;
  stockQty: number;
}

export interface BulkStockUpdateRequest {
  items: BulkStockItem[];
}

export interface BulkStockUpdateResult {
  updated: number;
  failed: string[];
}

export interface SearchTermStat {
  term: string;
  count: number;
}

export interface ConversionFunnel {
  productViews: number;
  cartAdds: number;
  checkoutStarts: number;
  orders: number;
}

export type AnalyticsEventType = 'PRODUCT_VIEW' | 'ADD_TO_CART' | 'CHECKOUT_START';

export interface AnalyticsEventRequest {
  eventType: AnalyticsEventType;
  productId?: string;
  metadata?: Record<string, string>;
}

export interface UpsertCategoryRequest {
  name: string;
  slug?: string;
  parentId?: string | null;
  sortOrder: number;
  active: boolean;
}

export interface UpsertProductRequest {
  categoryId: string;
  name: string;
  slug?: string;
  description?: string | null;
  basePrice: number;
  compareAtPrice?: number | null;
  stockQty: number;
  visible: boolean;
  featured: boolean;
}

export function isSuperCategory(category: Category): boolean {
  return !category.parentId;
}

export function isSubCategory(category: Category): boolean {
  return Boolean(category.parentId);
}

export interface CatalogDashboardStats {
  lowStockThreshold: number;
  lowStockCount: number;
  lowStockProducts: Product[];
  pendingReviewCount: number;
  topSearchTerms: SearchTermStat[];
  funnelStats: ConversionFunnel;
}

export interface AuditLogEntry {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface AuditLogParams {
  page?: number;
  size?: number;
  action?: string;
  from?: string;
  to?: string;
}

export interface SearchSuggestItem {
  id: string;
  label: string;
  slug: string;
  type: 'product' | 'category';
}

export interface SearchSuggestResponse {
  products: SearchSuggestItem[];
  categories: SearchSuggestItem[];
}
