package com.pixelmart.catalog.dto;

import com.pixelmart.catalog.domain.StoreSettings;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public final class StoreSettingsDtos {

    private StoreSettingsDtos() {
    }

    public record PublicStoreSettingsResponse(
            String storeName,
            String logoUrl,
            String faviconUrl,
            String primaryColor,
            String supportEmail,
            String marketCurrencyCode,
            String marketCurrencySymbol,
            String marketLocale,
            boolean taxEnabled,
            BigDecimal taxRatePercent,
            String taxLabel
    ) {
        public static PublicStoreSettingsResponse from(StoreSettings settings, String logoUrl) {
            return new PublicStoreSettingsResponse(
                    settings.getStoreName(),
                    logoUrl,
                    settings.getFaviconUrl(),
                    settings.getPrimaryColor(),
                    settings.getSupportEmail(),
                    settings.getMarketCurrencyCode(),
                    settings.getMarketCurrencySymbol(),
                    settings.getMarketLocale(),
                    settings.isTaxEnabled(),
                    settings.getTaxRatePercent(),
                    settings.getTaxLabel()
            );
        }
    }

    public record UpdateStoreSettingsRequest(
            @NotBlank @Size(max = 255) String storeName,
            @NotBlank @Pattern(regexp = "^#[0-9A-Fa-f]{6}$") String primaryColor,
            @Size(max = 255) String supportEmail,
            @NotBlank @Size(max = 8) String marketCurrencyCode,
            @NotBlank @Size(max = 8) String marketCurrencySymbol,
            @NotBlank @Size(max = 16) String marketLocale,
            boolean taxEnabled,
            @DecimalMin("0") @DecimalMax("100") BigDecimal taxRatePercent,
            @NotBlank @Size(max = 64) String taxLabel
    ) {
    }

    public record AdminStoreSettingsResponse(
            String storeName,
            String logoUrl,
            String primaryColor,
            String supportEmail,
            String marketCurrencyCode,
            String marketCurrencySymbol,
            String marketLocale,
            boolean taxEnabled,
            BigDecimal taxRatePercent,
            String taxLabel
    ) {
        public static AdminStoreSettingsResponse from(StoreSettings settings, String logoUrl) {
            return new AdminStoreSettingsResponse(
                    settings.getStoreName(),
                    logoUrl,
                    settings.getPrimaryColor(),
                    settings.getSupportEmail(),
                    settings.getMarketCurrencyCode(),
                    settings.getMarketCurrencySymbol(),
                    settings.getMarketLocale(),
                    settings.isTaxEnabled(),
                    settings.getTaxRatePercent(),
                    settings.getTaxLabel()
            );
        }
    }
}
