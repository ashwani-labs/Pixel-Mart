package com.pixelmart.catalog.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public final class ProductRequests {

  private ProductRequests() {}

  public record CreateProductRequest(
      @NotBlank String categoryId,
      @NotBlank @Size(max = 255) String name,
      @Size(max = 255) String slug,
      String description,
      @NotNull @DecimalMin("0.0") BigDecimal basePrice,
      @DecimalMin("0.0") BigDecimal compareAtPrice,
      @Min(0) int stockQty,
      boolean visible,
      boolean featured,
      List<ProductHighlightItem> highlights) {}

  public record UpdateProductRequest(
      @NotBlank String categoryId,
      @NotBlank @Size(max = 255) String name,
      @Size(max = 255) String slug,
      String description,
      @NotNull @DecimalMin("0.0") BigDecimal basePrice,
      @DecimalMin("0.0") BigDecimal compareAtPrice,
      @Min(0) int stockQty,
      boolean visible,
      boolean featured,
      List<ProductHighlightItem> highlights) {}

  public record UpdateProductVisibilityRequest(boolean visible) {}
}
