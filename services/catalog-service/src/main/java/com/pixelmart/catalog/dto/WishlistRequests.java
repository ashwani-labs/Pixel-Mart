package com.pixelmart.catalog.dto;

import jakarta.validation.constraints.NotBlank;

public final class WishlistRequests {

    private WishlistRequests() {
    }

    public record ToggleWishlistRequest(
            @NotBlank String productId
    ) {
    }
}
