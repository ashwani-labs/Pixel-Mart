import { baseApi } from './baseApi';

export const healthApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    authHealth: build.query<{ service: string; status: string }, void>({
      query: () => '/auth/health',
    }),
    catalogHealth: build.query<{ service: string; status: string }, void>({
      query: () => '/catalog/health',
    }),
  }),
});

export const { useAuthHealthQuery, useCatalogHealthQuery } = healthApi;
