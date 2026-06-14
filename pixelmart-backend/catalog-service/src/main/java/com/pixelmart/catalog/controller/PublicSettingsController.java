package com.pixelmart.catalog.controller;

import com.pixelmart.catalog.dto.StoreSettingsDtos.PublicStoreSettingsResponse;
import com.pixelmart.catalog.service.StoreSettingsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog/settings")
public class PublicSettingsController {

    private final StoreSettingsService storeSettingsService;

    public PublicSettingsController(StoreSettingsService storeSettingsService) {
        this.storeSettingsService = storeSettingsService;
    }

    @GetMapping("/public")
    public PublicStoreSettingsResponse getPublic() {
        return storeSettingsService.getPublic();
    }
}
