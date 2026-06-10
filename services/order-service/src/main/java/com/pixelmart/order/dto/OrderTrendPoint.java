package com.pixelmart.order.dto;

import java.math.BigDecimal;

public record OrderTrendPoint(
        String date,
        long orderCount,
        BigDecimal revenue
) {
}
