package com.pixelmart.catalog.dto;

import com.pixelmart.catalog.domain.Product;
import com.pixelmart.catalog.service.OfferPricing;

import java.math.BigDecimal;

public record InternalProductResponse(
        String id,
        String name,
        String slug,
        BigDecimal basePrice,
        BigDecimal effectivePrice,
        int stockQty,
        boolean visible,
        boolean couponMatched
) {
    public static InternalProductResponse from(Product product, OfferPricing pricing) {
        return new InternalProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getBasePrice(),
                pricing.effectivePrice(),
                product.getStockQty(),
                product.isVisible(),
                pricing.couponMatched()
        );
    }
}
