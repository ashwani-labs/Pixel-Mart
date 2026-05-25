import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PublicStoreSettings } from '../../types/settings';

interface SettingsState {
  loaded: boolean;
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  marketCurrencyCode: string;
  marketCurrencySymbol: string;
  marketLocale: string;
  taxEnabled: boolean;
  taxRatePercent: number;
  taxLabel: string;
}

const initialState: SettingsState = {
  loaded: false,
  storeName: 'PixelMart',
  logoUrl: null,
  primaryColor: '#6366f1',
  marketCurrencyCode: 'INR',
  marketCurrencySymbol: '₹',
  marketLocale: 'en-IN',
  taxEnabled: true,
  taxRatePercent: 18,
  taxLabel: 'GST',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setPublicSettings(state, action: PayloadAction<PublicStoreSettings>) {
      const s = action.payload;
      state.loaded = true;
      state.storeName = s.storeName;
      state.logoUrl = s.logoUrl;
      state.primaryColor = s.primaryColor;
      state.marketCurrencyCode = s.marketCurrencyCode;
      state.marketCurrencySymbol = s.marketCurrencySymbol;
      state.marketLocale = s.marketLocale;
      state.taxEnabled = s.taxEnabled;
      state.taxRatePercent = s.taxRatePercent;
      state.taxLabel = s.taxLabel;
    },
  },
});

export const { setPublicSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
