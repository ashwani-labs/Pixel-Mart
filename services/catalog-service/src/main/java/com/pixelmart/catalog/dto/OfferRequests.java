package com.pixelmart.catalog.dto;

import com.pixelmart.catalog.domain.OfferScope;
import com.pixelmart.catalog.domain.OfferType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;

public final class OfferRequests {

    private OfferRequests() {
    }

    public record CreateOfferRequest(
            @NotBlank String name,
            @NotNull OfferType type,
            @NotNull OfferScope scope,
            String productId,
            String categoryId,
            @NotNull @DecimalMin("0.01") BigDecimal value,
            @NotNull Instant startsAt,
            Instant endsAt,
            String couponCode,
            Boolean active
    ) {
    }

    public record UpdateOfferRequest(
            @NotBlank String name,
            @NotNull OfferType type,
            @NotNull OfferScope scope,
            String productId,
            String categoryId,
            @NotNull @DecimalMin("0.01") BigDecimal value,
            @NotNull Instant startsAt,
            Instant endsAt,
            String couponCode,
            Boolean active
    ) {
    }
}
