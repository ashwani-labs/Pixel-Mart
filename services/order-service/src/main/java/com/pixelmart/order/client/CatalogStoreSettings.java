package com.pixelmart.order.client;

import java.math.BigDecimal;

public record CatalogStoreSettings(
        boolean taxEnabled,
        BigDecimal taxRatePercent,
        String taxLabel,
        String marketCurrencyCode
) {
    public BigDecimal effectiveTaxRate() {
        return taxEnabled ? taxRatePercent : BigDecimal.ZERO;
    }

    public String effectiveTaxLabel() {
        return taxLabel == null || taxLabel.isBlank() ? "Tax" : taxLabel;
    }

    public String effectiveCurrencyCode() {
        return marketCurrencyCode == null || marketCurrencyCode.isBlank() ? "INR" : marketCurrencyCode;
    }
}
