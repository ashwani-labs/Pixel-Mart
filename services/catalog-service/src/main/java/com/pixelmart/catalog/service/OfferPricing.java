package com.pixelmart.catalog.service;

import java.math.BigDecimal;

public record OfferPricing(
        BigDecimal effectivePrice,
        BigDecimal compareAtPrice,
        String offerName,
        String appliedCouponCode,
        boolean couponMatched
) {
}
