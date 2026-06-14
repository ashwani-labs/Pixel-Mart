package com.pixelmart.order.client;

import java.math.BigDecimal;

public record CatalogProductSnapshot(
        String id,
        String name,
        String slug,
        BigDecimal basePrice,
        BigDecimal effectivePrice,
        int stockQty,
        boolean visible,
        boolean couponMatched
) {
}
