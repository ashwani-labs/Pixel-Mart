package com.pixelmart.catalog.dto;

import com.pixelmart.catalog.domain.Product;
import com.pixelmart.catalog.service.OfferPricing;

import java.math.BigDecimal;
import java.util.List;

public record ProductDetailResponse(
        String id,
        String categoryId,
        String name,
        String slug,
        String description,
        BigDecimal basePrice,
        BigDecimal effectivePrice,
        BigDecimal compareAtPrice,
        String offerName,
        int stockQty,
        boolean featured,
        List<ProductImageResponse> images
) {
    public static ProductDetailResponse fromPublic(
            Product product,
            OfferPricing pricing,
            List<ProductImageResponse> images
    ) {
        return new ProductDetailResponse(
                product.getId(),
                product.getCategoryId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getBasePrice(),
                pricing.effectivePrice(),
                pricing.compareAtPrice(),
                pricing.offerName(),
                product.getStockQty(),
                product.isFeatured(),
                images
        );
    }
}
