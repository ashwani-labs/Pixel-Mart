import type { Address, PincodeLookup, UpsertAddressRequest } from '../../types/address';
import type {
  AddCartItemRequest,
  Cart,
  CheckoutRequest,
  Order,
  OrderDashboardStats,
  UpdateCartItemRequest,
} from '../../types/order';
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
    getAddresses: build.query<Address[], void>({
      query: () => '/orders/addresses',
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({ type: 'Address' as const, id: a.id })),
              { type: 'Address', id: 'LIST' },
            ]
          : [{ type: 'Address', id: 'LIST' }],
    }),
    getAddress: build.query<Address, string>({
      query: (id) => `/orders/addresses/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Address', id }],
    }),
    lookupPincode: build.query<PincodeLookup, string>({
      query: (pincode) => `/orders/addresses/pincode/${pincode}`,
    }),
    createAddress: build.mutation<Address, UpsertAddressRequest>({
      query: (body) => ({
        url: '/orders/addresses',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),
    updateAddress: build.mutation<Address, { id: string; body: UpsertAddressRequest }>({
      query: ({ id, body }) => ({
        url: `/orders/addresses/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Address', id },
        { type: 'Address', id: 'LIST' },
      ],
    }),
    setDefaultAddress: build.mutation<Address, string>({
      query: (id) => ({
        url: `/orders/addresses/${id}/default`,
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),
    deleteAddress: build.mutation<void, string>({
      query: (id) => ({
        url: `/orders/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),
    checkout: build.mutation<Order, CheckoutRequest>({
      query: (body) => ({
        url: '/orders/checkout',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart', 'Order'],
    }),
    getOrders: build.query<Order[], void>({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    getOrder: build.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),
    getAdminOrders: build.query<Order[], void>({
      query: () => '/admin/orders',
      providesTags: ['Order'],
    }),
    updateAdminOrderStatus: build.mutation<Order, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Order', 'Dashboard'],
    }),
    getOrderDashboardStats: build.query<OrderDashboardStats, void>({
      query: () => '/admin/dashboard/orders',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useGetAddressesQuery,
  useGetAddressQuery,
  useLazyLookupPincodeQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useSetDefaultAddressMutation,
  useDeleteAddressMutation,
  useCheckoutMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
  useGetOrderDashboardStatsQuery,
} = orderApi;
