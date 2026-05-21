package com.pixelmart.catalog.dto;

import com.pixelmart.catalog.domain.Product;

import java.math.BigDecimal;
import java.util.List;

public record ProductDetailResponse(
        String id,
        String categoryId,
        String name,
        String slug,
        String description,
        BigDecimal basePrice,
        BigDecimal compareAtPrice,
        int stockQty,
        boolean featured,
        List<ProductImageResponse> images
) {
    public static ProductDetailResponse fromPublic(Product product, List<ProductImageResponse> images) {
        return new ProductDetailResponse(
                product.getId(),
                product.getCategoryId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getBasePrice(),
                product.getCompareAtPrice(),
                product.getStockQty(),
                product.isFeatured(),
                images
        );
    }
}
