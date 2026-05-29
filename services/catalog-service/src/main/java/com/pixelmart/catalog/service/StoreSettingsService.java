package com.pixelmart.catalog.service;

import com.pixelmart.catalog.domain.StoreSettings;
import com.pixelmart.catalog.dto.StoreSettingsDtos.AdminStoreSettingsResponse;
import com.pixelmart.catalog.dto.StoreSettingsDtos.PublicStoreSettingsResponse;
import com.pixelmart.catalog.dto.StoreSettingsDtos.UpdateStoreSettingsRequest;
import com.pixelmart.catalog.exception.ResourceNotFoundException;
import com.pixelmart.catalog.repository.StoreSettingsRepository;
import com.pixelmart.catalog.storage.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class StoreSettingsService {

    private static final String SETTINGS_ID = "default";

    private final StoreSettingsRepository storeSettingsRepository;
    private final StorageService storageService;
    private final MediaUrlService mediaUrlService;
    private final AuditLogService auditLogService;

    public StoreSettingsService(
            StoreSettingsRepository storeSettingsRepository,
            StorageService storageService,
            MediaUrlService mediaUrlService,
            AuditLogService auditLogService
    ) {
        this.storeSettingsRepository = storeSettingsRepository;
        this.storageService = storageService;
        this.mediaUrlService = mediaUrlService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public PublicStoreSettingsResponse getPublic() {
        StoreSettings settings = findSettings();
        return PublicStoreSettingsResponse.from(settings, resolveLogoUrl(settings));
    }

    @Transactional(readOnly = true)
    public AdminStoreSettingsResponse getAdmin() {
        StoreSettings settings = findSettings();
        return AdminStoreSettingsResponse.from(settings, resolveLogoUrl(settings));
    }

    @Transactional
    public AdminStoreSettingsResponse update(UpdateStoreSettingsRequest request) {
        StoreSettings settings = findSettings();
        Map<String, Object> before = snapshot(settings);
        apply(settings, request);
        storeSettingsRepository.save(settings);
        auditLogService.log("STORE_SETTINGS_UPDATED", "store_settings", SETTINGS_ID, before, snapshot(settings));
        return AdminStoreSettingsResponse.from(settings, resolveLogoUrl(settings));
    }

    @Transactional
    public AdminStoreSettingsResponse uploadLogo(MultipartFile file) {
        StoreSettings settings = findSettings();
        if (settings.getLogoStorageKey() != null) {
            storageService.delete(settings.getLogoStorageKey());
        }
        StorageService.StoredObject stored = storageService.store("brand/logo", file);
        settings.setLogoStorageKey(stored.storageKey());
        settings.setLogoUrl(mediaUrlService.brandLogoUrl());
        storeSettingsRepository.save(settings);
        auditLogService.log(
                "STORE_LOGO_UPDATED",
                "store_settings",
                SETTINGS_ID,
                null,
                Map.of("logoStorageKey", stored.storageKey())
        );
        return AdminStoreSettingsResponse.from(settings, resolveLogoUrl(settings));
    }

    @Transactional(readOnly = true)
    public StoreSettings findSettings() {
        return storeSettingsRepository.findById(SETTINGS_ID)
                .orElseThrow(() -> new ResourceNotFoundException("StoreSettings", SETTINGS_ID));
    }

    String resolveLogoUrl(StoreSettings settings) {
        return settings.getLogoStorageKey() != null ? mediaUrlService.brandLogoUrl() : null;
    }

    private void apply(StoreSettings settings, UpdateStoreSettingsRequest request) {
        settings.setStoreName(request.storeName().trim());
        settings.setPrimaryColor(request.primaryColor());
        String email = request.supportEmail();
        settings.setSupportEmail(email == null || email.isBlank() ? null : email.trim());
        settings.setMarketCurrencyCode(request.marketCurrencyCode());
        settings.setMarketCurrencySymbol(request.marketCurrencySymbol());
        settings.setMarketLocale(request.marketLocale());
        settings.setTaxEnabled(request.taxEnabled());
        settings.setTaxRatePercent(request.taxRatePercent());
        settings.setTaxLabel(request.taxLabel());
    }

    private Map<String, Object> snapshot(StoreSettings settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("storeName", settings.getStoreName());
        map.put("primaryColor", settings.getPrimaryColor());
        map.put("supportEmail", settings.getSupportEmail());
        map.put("marketCurrencyCode", settings.getMarketCurrencyCode());
        map.put("marketCurrencySymbol", settings.getMarketCurrencySymbol());
        map.put("marketLocale", settings.getMarketLocale());
        map.put("taxEnabled", settings.isTaxEnabled());
        map.put("taxRatePercent", settings.getTaxRatePercent());
        map.put("taxLabel", settings.getTaxLabel());
        return map;
    }
}
