package com.pixelmart.catalog.dto;

import com.pixelmart.catalog.domain.Offer;
import com.pixelmart.catalog.domain.OfferScope;
import com.pixelmart.catalog.domain.OfferType;

import java.math.BigDecimal;
import java.time.Instant;

public record OfferResponse(
        String id,
        String name,
        OfferType type,
        OfferScope scope,
        String productId,
        String categoryId,
        BigDecimal value,
        Instant startsAt,
        Instant endsAt,
        String couponCode,
        boolean active
) {
    public static OfferResponse from(Offer offer) {
        return new OfferResponse(
                offer.getId(),
                offer.getName(),
                offer.getType(),
                offer.getScope(),
                offer.getProductId(),
                offer.getCategoryId(),
                offer.getValue(),
                offer.getStartsAt(),
                offer.getEndsAt(),
                offer.getCouponCode(),
                offer.isActive()
        );
    }
}
