package com.pixelmart.catalog.dto;

import com.pixelmart.catalog.domain.Product;

import java.math.BigDecimal;

public record ProductResponse(
        String id,
        String categoryId,
        String name,
        String slug,
        String description,
        BigDecimal basePrice,
        BigDecimal compareAtPrice,
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
                product.getCompareAtPrice(),
                product.getStockQty(),
                product.isVisible(),
                product.isFeatured()
        );
    }

    public static ProductResponse fromPublic(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getCategoryId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getBasePrice(),
                product.getCompareAtPrice(),
                product.getStockQty(),
                true,
                product.isFeatured()
        );
    }
}
