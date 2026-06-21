package com.pixelmart.catalog.dto;

import com.pixelmart.catalog.domain.ProductVariant;
import java.math.BigDecimal;

public record ProductVariantResponse(
    String id, String sku, String label, String size, String color, BigDecimal price, int stockQty) {
  public static ProductVariantResponse from(ProductVariant variant) {
    String label =
        java.util.stream.Stream.of(variant.getSize(), variant.getColor())
            .filter(value -> value != null && !value.isBlank())
            .reduce((left, right) -> left + " / " + right)
            .orElse(variant.getSku());
    return new ProductVariantResponse(
        variant.getId(),
        variant.getSku(),
        label,
        variant.getSize(),
        variant.getColor(),
        variant.getPrice(),
        variant.getStockQty());
  }
}
