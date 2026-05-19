import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { AuthResponse } from '../../types/auth';
import type { RootState } from '../index';
import { clearCredentials, setCredentials } from '../slices/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const AUTH_URLS_SKIP_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

function shouldAttemptRefresh(url: string | undefined, status: number | string | undefined) {
  if (status !== 401 || !url) return false;
  return !AUTH_URLS_SKIP_REFRESH.some((path) => url.includes(path));
}

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === 'string' ? args : args.url;

  if (result.error && shouldAttemptRefresh(url, result.error.status)) {
    const refreshResult = await rawBaseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const data = refreshResult.data as AuthResponse;
      api.dispatch(setCredentials({ accessToken: data.accessToken, user: data.user }));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Product',
    'ProductList',
    'Category',
    'Offer',
    'Cart',
    'Order',
    'Settings',
    'Wishlist',
    'Review',
    'AuditLog',
    'User',
  ],
  endpoints: () => ({}),
});
