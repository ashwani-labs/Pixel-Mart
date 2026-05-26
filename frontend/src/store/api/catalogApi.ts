import type {
  Category,
  Offer,
  PageResponse,
  Product,
  ProductDetail,
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
  useGetAdminOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} = catalogApi;
