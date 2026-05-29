package com.pixelmart.order.dto;

import java.math.BigDecimal;

public record AdminOrderDashboardResponse(
        long ordersToday,
        BigDecimal revenueToday
) {
}
