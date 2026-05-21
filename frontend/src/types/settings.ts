export interface PublicStoreSettings {
  storeName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  supportEmail: string | null;
  marketCurrencyCode: string;
  marketCurrencySymbol: string;
  marketLocale: string;
  taxEnabled: boolean;
  taxRatePercent: number;
  taxLabel: string;
}

export interface AdminStoreSettings {
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  supportEmail: string | null;
  marketCurrencyCode: string;
  marketCurrencySymbol: string;
  marketLocale: string;
  taxEnabled: boolean;
  taxRatePercent: number;
  taxLabel: string;
}

export interface UpdateStoreSettingsRequest {
  storeName: string;
  primaryColor: string;
  supportEmail: string;
  marketCurrencyCode: string;
  marketCurrencySymbol: string;
  marketLocale: string;
  taxEnabled: boolean;
  taxRatePercent: number;
  taxLabel: string;
}
