package com.pixelmart.catalog.service;

import org.springframework.stereotype.Service;

@Service
public class MediaUrlService {

    public static final String BRAND_LOGO_PATH = "/api/catalog/media/brand";

    public String productImageUrl(String imageId) {
        return "/api/catalog/media/" + imageId;
    }

    public String brandLogoUrl() {
        return BRAND_LOGO_PATH;
    }
}
