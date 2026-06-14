package com.pixelmart.catalog.dto;

import com.pixelmart.catalog.service.CartOfferPricing;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public final class CartDiscountDtos {

    private CartDiscountDtos() {
    }

    public record CartDiscountRequest(
            @NotNull @PositiveOrZero BigDecimal subtotal,
            String couponCode
    ) {
    }

    public record CartDiscountResponse(
            BigDecimal discountTotal,
            String offerName,
            String appliedCouponCode,
            boolean couponMatched
    ) {
        public static CartDiscountResponse from(CartOfferPricing pricing) {
            return new CartDiscountResponse(
                    pricing.discountTotal(),
                    pricing.offerName(),
                    pricing.appliedCouponCode(),
                    pricing.couponMatched()
            );
        }
    }
}
