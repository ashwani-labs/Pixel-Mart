import type { Category, PageResponse, Product, ProductDetail } from '../../types/catalog';
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
  }),
});

export const { useGetCategoriesQuery, useGetProductsQuery, useGetProductBySlugQuery } = catalogApi;
