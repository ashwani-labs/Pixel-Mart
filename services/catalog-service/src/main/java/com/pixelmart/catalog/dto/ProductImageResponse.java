package com.pixelmart.catalog.dto;

import com.pixelmart.catalog.domain.ProductImage;

public record ProductImageResponse(
        String id,
        String url,
        String altText,
        int sortOrder
) {
    public static ProductImageResponse from(ProductImage image, String url) {
        return new ProductImageResponse(image.getId(), url, image.getAltText(), image.getSortOrder());
    }
}
