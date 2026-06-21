package com.pixelmart.catalog.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public final class BulkStockRequests {

  private BulkStockRequests() {}

  public record BulkStockUpdateRequest(@NotEmpty List<@Valid BulkStockLine> items) {}

  public record BulkStockLine(@NotBlank String productId, @Min(0) int stockQty) {}
}
