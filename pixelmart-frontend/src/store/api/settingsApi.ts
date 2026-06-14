import type { AdminStoreSettings, PublicStoreSettings, UpdateStoreSettingsRequest } from '../../types/settings';
import type { ProductImage } from '../../types/catalog';
import { baseApi } from './baseApi';

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPublicSettings: build.query<PublicStoreSettings, void>({
      query: () => '/catalog/settings/public',
      providesTags: ['Settings'],
    }),
    getAdminStoreSettings: build.query<AdminStoreSettings, void>({
      query: () => '/admin/settings/store',
      providesTags: ['Settings'],
    }),
    updateStoreSettings: build.mutation<AdminStoreSettings, UpdateStoreSettingsRequest>({
      query: (body) => ({
        url: '/admin/settings/store',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),
    uploadStoreLogo: build.mutation<AdminStoreSettings, File>({
      query: (file) => {
        const form = new FormData();
        form.append('file', file);
        return {
          url: '/admin/settings/logo',
          method: 'POST',
          body: form,
        };
      },
      invalidatesTags: ['Settings'],
    }),
    uploadProductImage: build.mutation<ProductImage, { productId: string; file: File; altText?: string }>({
      query: ({ productId, file, altText }) => {
        const form = new FormData();
        form.append('file', file);
        if (altText) {
          form.append('altText', altText);
        }
        return {
          url: `/admin/products/${productId}/images`,
          method: 'POST',
          body: form,
        };
      },
      invalidatesTags: (_r, _e, { productId }) => [{ type: 'Product', id: productId }],
    }),
  }),
});

export const {
  useGetPublicSettingsQuery,
  useGetAdminStoreSettingsQuery,
  useUpdateStoreSettingsMutation,
  useUploadStoreLogoMutation,
  useUploadProductImageMutation,
} = settingsApi;
