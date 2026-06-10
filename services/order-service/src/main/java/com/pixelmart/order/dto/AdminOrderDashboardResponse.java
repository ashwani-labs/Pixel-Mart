package com.pixelmart.order.dto;

import java.math.BigDecimal;
import java.util.List;

public record AdminOrderDashboardResponse(
        long ordersToday,
        BigDecimal revenueToday,
        List<OrderTrendPoint> trends
) {
}
