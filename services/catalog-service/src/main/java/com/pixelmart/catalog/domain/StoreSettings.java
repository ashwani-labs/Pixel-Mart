package com.pixelmart.catalog.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "store_settings")
public class StoreSettings {

    @Id
    @Column(length = 32, nullable = false)
    private String id = "default";

    @Column(name = "store_name", nullable = false)
    private String storeName;

    @Column(name = "logo_url", length = 512)
    private String logoUrl;

    @Column(name = "logo_storage_key", length = 512)
    private String logoStorageKey;

    @Column(name = "favicon_url", length = 512)
    private String faviconUrl;

    @Column(name = "primary_color", nullable = false, length = 16)
    private String primaryColor;

    @Column(name = "support_email")
    private String supportEmail;

    @Column(name = "market_currency_code", nullable = false, length = 8)
    private String marketCurrencyCode;

    @Column(name = "market_currency_symbol", nullable = false, length = 8)
    private String marketCurrencySymbol;

    @Column(name = "market_locale", nullable = false, length = 16)
    private String marketLocale;

    @Column(name = "tax_enabled", nullable = false)
    private boolean taxEnabled;

    @Column(name = "tax_rate_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxRatePercent;

    @Column(name = "tax_label", nullable = false, length = 64)
    private String taxLabel;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getLogoStorageKey() {
        return logoStorageKey;
    }

    public void setLogoStorageKey(String logoStorageKey) {
        this.logoStorageKey = logoStorageKey;
    }

    public String getFaviconUrl() {
        return faviconUrl;
    }

    public void setFaviconUrl(String faviconUrl) {
        this.faviconUrl = faviconUrl;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public void setPrimaryColor(String primaryColor) {
        this.primaryColor = primaryColor;
    }

    public String getSupportEmail() {
        return supportEmail;
    }

    public void setSupportEmail(String supportEmail) {
        this.supportEmail = supportEmail;
    }

    public String getMarketCurrencyCode() {
        return marketCurrencyCode;
    }

    public void setMarketCurrencyCode(String marketCurrencyCode) {
        this.marketCurrencyCode = marketCurrencyCode;
    }

    public String getMarketCurrencySymbol() {
        return marketCurrencySymbol;
    }

    public void setMarketCurrencySymbol(String marketCurrencySymbol) {
        this.marketCurrencySymbol = marketCurrencySymbol;
    }

    public String getMarketLocale() {
        return marketLocale;
    }

    public void setMarketLocale(String marketLocale) {
        this.marketLocale = marketLocale;
    }

    public boolean isTaxEnabled() {
        return taxEnabled;
    }

    public void setTaxEnabled(boolean taxEnabled) {
        this.taxEnabled = taxEnabled;
    }

    public BigDecimal getTaxRatePercent() {
        return taxRatePercent;
    }

    public void setTaxRatePercent(BigDecimal taxRatePercent) {
        this.taxRatePercent = taxRatePercent;
    }

    public String getTaxLabel() {
        return taxLabel;
    }

    public void setTaxLabel(String taxLabel) {
        this.taxLabel = taxLabel;
    }
}
