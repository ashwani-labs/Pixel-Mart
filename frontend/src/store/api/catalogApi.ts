import type {
  Category,
  Offer,
  PageResponse,
  Product,
  ProductDetail,
  Review,
  SubmitReviewRequest,
  UpsertOfferRequest,
} from '../../types/catalog';
import { baseApi } from './baseApi';

export interface ProductListParams {
  page?: number;
  size?: number;
  categoryId?: string;
  search?: string;
  featured?: boolean;
}

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<Category[], void>({
      query: () => '/catalog/categories',
      providesTags: ['Category'],
    }),
    getProducts: build.query<PageResponse<Product>, ProductListParams>({
      query: ({ page = 0, size = 12, categoryId, search, featured }) => ({
        url: '/catalog/products',
        params: {
          page,
          size,
          categoryId: categoryId || undefined,
          search: search || undefined,
          featured: featured ?? undefined,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((p) => ({ type: 'Product' as const, id: p.id })),
              { type: 'ProductList', id: 'LIST' },
            ]
          : [{ type: 'ProductList', id: 'LIST' }],
    }),
    getProductBySlug: build.query<ProductDetail, string>({
      query: (slug) => `/catalog/products/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: 'Product', id: slug }],
    }),
    getActiveOffers: build.query<Offer[], void>({
      query: () => '/catalog/offers/active',
      providesTags: ['Offer'],
    }),
    getWishlist: build.query<Product[], void>({
      query: () => '/catalog/wishlist',
      providesTags: ['Wishlist'],
    }),
    addWishlistItem: build.mutation<void, string>({
      query: (productId) => ({
        url: '/catalog/wishlist',
        method: 'POST',
        body: { productId },
      }),
      invalidatesTags: ['Wishlist'],
    }),
    removeWishlistItem: build.mutation<void, string>({
      query: (productId) => ({
        url: '/catalog/wishlist',
        method: 'DELETE',
        body: { productId },
      }),
      invalidatesTags: ['Wishlist'],
    }),
    getProductReviews: build.query<Review[], string>({
      query: (productId) => `/catalog/products/${productId}/reviews`,
      providesTags: (_r, _e, productId) => [{ type: 'Review', id: productId }],
    }),
    getMyReview: build.query<Review | null, string>({
      query: (productId) => `/catalog/reviews/me?productId=${productId}`,
      providesTags: (_r, _e, productId) => [{ type: 'Review', id: `mine-${productId}` }],
    }),
    submitReview: build.mutation<Review, SubmitReviewRequest>({
      query: (body) => ({
        url: '/catalog/reviews',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'Review', id: productId },
        { type: 'Review', id: `mine-${productId}` },
        { type: 'Review', id: 'LIST' },
      ],
    }),
    getAdminReviews: build.query<PageResponse<Review>, { status?: string } | void>({
      query: (params) => ({
        url: '/admin/reviews',
        params: params?.status ? { status: params.status } : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((review) => ({ type: 'Review' as const, id: review.id })),
              { type: 'Review', id: 'LIST' },
            ]
          : [{ type: 'Review', id: 'LIST' }],
    }),
    moderateReview: build.mutation<Review, { id: string; status: 'APPROVED' | 'REJECTED' }>({
      query: ({ id, status }) => ({
        url: `/admin/reviews/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result) =>
        result
          ? [
              { type: 'Review', id: result.id },
              { type: 'Review', id: result.productId },
              { type: 'Review', id: `mine-${result.productId}` },
              { type: 'Review', id: 'LIST' },
            ]
          : [{ type: 'Review', id: 'LIST' }],
    }),
    getAdminOffers: build.query<PageResponse<Offer>, void>({
      query: () => '/admin/offers',
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((offer) => ({ type: 'Offer' as const, id: offer.id })),
              { type: 'Offer', id: 'LIST' },
            ]
          : [{ type: 'Offer', id: 'LIST' }],
    }),
    createOffer: build.mutation<Offer, UpsertOfferRequest>({
      query: (body) => ({
        url: '/admin/offers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Offer', id: 'LIST' },
        { type: 'ProductList', id: 'LIST' },
        'Cart',
      ],
    }),
    updateOffer: build.mutation<Offer, { id: string; body: UpsertOfferRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/offers/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Offer', id },
        { type: 'Offer', id: 'LIST' },
        { type: 'ProductList', id: 'LIST' },
        'Cart',
      ],
    }),
    deleteOffer: build.mutation<void, string>({
      query: (id) => ({
        url: `/admin/offers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Offer', id: 'LIST' },
        { type: 'ProductList', id: 'LIST' },
        'Cart',
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetActiveOffersQuery,
  useGetWishlistQuery,
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
  useGetProductReviewsQuery,
  useGetMyReviewQuery,
  useSubmitReviewMutation,
  useGetAdminReviewsQuery,
  useModerateReviewMutation,
  useGetAdminOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} = catalogApi;
