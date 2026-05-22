import type { AddCartItemRequest, Cart, UpdateCartItemRequest } from '../../types/order';
import { baseApi } from './baseApi';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCart: build.query<Cart, void>({
      query: () => '/orders/cart/items',
      providesTags: ['Cart'],
    }),
    addCartItem: build.mutation<Cart, AddCartItemRequest>({
      query: (body) => ({
        url: '/orders/cart/items',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: build.mutation<Cart, { id: string; body: UpdateCartItemRequest }>({
      query: ({ id, body }) => ({
        url: `/orders/cart/items/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: build.mutation<Cart, string>({
      query: (id) => ({
        url: `/orders/cart/items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
} = orderApi;
