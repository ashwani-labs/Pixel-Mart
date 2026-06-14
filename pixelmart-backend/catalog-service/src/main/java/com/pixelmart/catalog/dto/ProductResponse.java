package com.pixelmart.catalog.dto;

import com.pixelmart.catalog.domain.Product;
import com.pixelmart.catalog.service.OfferPricing;

import java.math.BigDecimal;

public record ProductResponse(
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
        boolean visible,
        boolean featured
) {
    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getCategoryId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getBasePrice(),
                product.getBasePrice(),
                product.getCompareAtPrice(),
                null,
                product.getStockQty(),
                product.isVisible(),
                product.isFeatured()
        );
    }

    public static ProductResponse fromPublic(Product product, OfferPricing pricing) {
        return new ProductResponse(
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
                true,
                product.isFeatured()
        );
    }
}
