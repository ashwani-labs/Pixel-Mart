package com.pixelmart.order.service;

import com.pixelmart.order.dto.AdminOrderDashboardResponse;
import com.pixelmart.order.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

@Service
public class AdminDashboardService {

    private final OrderRepository orderRepository;

    public AdminDashboardService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public AdminOrderDashboardResponse orderStats() {
        Instant startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
        long ordersToday = orderRepository.countByCreatedAtGreaterThanEqual(startOfDay);
        BigDecimal revenueToday = orderRepository.sumGrandTotalSince(startOfDay);
        return new AdminOrderDashboardResponse(ordersToday, revenueToday);
    }
}
