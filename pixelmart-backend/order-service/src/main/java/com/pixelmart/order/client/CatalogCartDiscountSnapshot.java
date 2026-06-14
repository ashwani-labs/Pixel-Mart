package com.pixelmart.order.client;

import java.math.BigDecimal;

public record CatalogCartDiscountSnapshot(
        BigDecimal discountTotal,
        String offerName,
        String appliedCouponCode,
        boolean couponMatched
) {
}
