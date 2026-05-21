package com.pixelmart.catalog.controller;

import com.pixelmart.catalog.dto.StoreSettingsDtos.AdminStoreSettingsResponse;
import com.pixelmart.catalog.dto.StoreSettingsDtos.UpdateStoreSettingsRequest;
import com.pixelmart.catalog.service.StoreSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/settings")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSettingsController {

    private final StoreSettingsService storeSettingsService;

    public AdminSettingsController(StoreSettingsService storeSettingsService) {
        this.storeSettingsService = storeSettingsService;
    }

    @GetMapping("/store")
    public AdminStoreSettingsResponse get() {
        return storeSettingsService.getAdmin();
    }

    @PutMapping("/store")
    public AdminStoreSettingsResponse update(@Valid @RequestBody UpdateStoreSettingsRequest request) {
        return storeSettingsService.update(request);
    }

    @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AdminStoreSettingsResponse uploadLogo(@RequestParam("file") MultipartFile file) {
        return storeSettingsService.uploadLogo(file);
    }
}
