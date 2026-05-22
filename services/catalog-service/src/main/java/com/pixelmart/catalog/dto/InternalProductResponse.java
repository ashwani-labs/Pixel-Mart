package com.pixelmart.catalog.dto;

import com.pixelmart.catalog.domain.Product;

import java.math.BigDecimal;

public record InternalProductResponse(
        String id,
        String name,
        String slug,
        BigDecimal basePrice,
        int stockQty,
        boolean visible
) {
    public static InternalProductResponse from(Product product) {
        return new InternalProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getBasePrice(),
                product.getStockQty(),
                product.isVisible()
        );
    }
}
