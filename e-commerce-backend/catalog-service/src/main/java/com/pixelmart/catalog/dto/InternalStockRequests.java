package com.pixelmart.catalog.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public final class InternalStockRequests {

    private InternalStockRequests() {
    }

    public record ReserveStockRequest(
            @NotEmpty List<@Valid ReserveStockLine> items
    ) {
    }

    public record ReserveStockLine(
            @NotBlank String productId,
            @Min(1) int quantity
    ) {
    }
}
