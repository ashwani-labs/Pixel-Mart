package com.pixelmart.catalog.controller;

import com.pixelmart.catalog.service.ProductImageService;
import com.pixelmart.catalog.service.StoreSettingsService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog/media")
public class MediaController {

    private final ProductImageService productImageService;
    private final StoreSettingsService storeSettingsService;

    public MediaController(ProductImageService productImageService, StoreSettingsService storeSettingsService) {
        this.productImageService = productImageService;
        this.storeSettingsService = storeSettingsService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> productImage(@PathVariable String id) {
        return toResponse(productImageService.getProductImage(id));
    }

    @GetMapping("/brand")
    public ResponseEntity<Resource> brandLogo() {
        return toResponse(productImageService.getBrandLogo(storeSettingsService));
    }

    private ResponseEntity<Resource> toResponse(ProductImageService.MediaResource media) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .contentType(MediaType.parseMediaType(media.contentType()))
                .body(media.resource());
    }
}
