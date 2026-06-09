package com.pixelmart.catalog.service;

import java.math.BigDecimal;

public record CartOfferPricing(
        BigDecimal discountTotal,
        String offerName,
        String appliedCouponCode,
        boolean couponMatched
) {
}
