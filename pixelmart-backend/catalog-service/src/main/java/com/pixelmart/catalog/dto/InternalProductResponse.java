package com.pixelmart.catalog.dto;

import com.pixelmart.catalog.domain.Product;
import com.pixelmart.catalog.domain.ProductVariant;
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
    boolean couponMatched,
    String variantId,
    String variantSku,
    String variantSize,
    String variantColor) {
  public static InternalProductResponse from(Product product, OfferPricing pricing) {
    return from(product, pricing, null);
  }

  public static InternalProductResponse from(
      Product product, OfferPricing pricing, ProductVariant variant) {
    BigDecimal effectivePrice =
        variant != null ? variant.getPrice() : pricing.effectivePrice();
    int stockQty = variant != null ? variant.getStockQty() : product.getStockQty();
    return new InternalProductResponse(
        product.getId(),
        product.getName(),
        product.getSlug(),
        product.getBasePrice(),
        effectivePrice,
        stockQty,
        product.isVisible(),
        pricing.couponMatched(),
        variant != null ? variant.getId() : null,
        variant != null ? variant.getSku() : null,
        variant != null ? variant.getSize() : null,
        variant != null ? variant.getColor() : null);
  }
}
