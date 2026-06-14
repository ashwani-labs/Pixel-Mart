package com.pixelmart.order.service;

import com.pixelmart.order.domain.Order;
import com.pixelmart.order.dto.AdminOrderDashboardResponse;
import com.pixelmart.order.dto.OrderTrendPoint;
import com.pixelmart.order.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private static final int TREND_DAYS = 7;

    private final OrderRepository orderRepository;

    public AdminDashboardService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public AdminOrderDashboardResponse orderStats() {
        Instant startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
        long ordersToday = orderRepository.countByCreatedAtGreaterThanEqual(startOfDay);
        BigDecimal revenueToday = orderRepository.sumGrandTotalSince(startOfDay);
        return new AdminOrderDashboardResponse(ordersToday, revenueToday, orderTrends(TREND_DAYS));
    }

    private List<OrderTrendPoint> orderTrends(int days) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate startDay = today.minusDays(days - 1L);
        Instant since = startDay.atStartOfDay().toInstant(ZoneOffset.UTC);
        Map<LocalDate, List<Order>> grouped = orderRepository.findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(since)
                .stream()
                .collect(Collectors.groupingBy(order ->
                        LocalDate.ofInstant(order.getCreatedAt(), ZoneOffset.UTC)));

        List<OrderTrendPoint> trends = new ArrayList<>();
        for (int offset = days - 1; offset >= 0; offset--) {
            LocalDate day = today.minusDays(offset);
            List<Order> dayOrders = grouped.getOrDefault(day, List.of());
            BigDecimal revenue = dayOrders.stream()
                    .map(Order::getGrandTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            trends.add(new OrderTrendPoint(day.toString(), dayOrders.size(), revenue));
        }
        return trends;
    }
}
