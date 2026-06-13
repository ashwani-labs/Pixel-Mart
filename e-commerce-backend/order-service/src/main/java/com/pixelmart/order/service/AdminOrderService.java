package com.pixelmart.order.service;

import com.pixelmart.order.domain.Order;
import com.pixelmart.order.domain.Payment;
import com.pixelmart.order.dto.CheckoutDtos.OrderResponse;
import com.pixelmart.order.dto.CheckoutDtos.UpdateOrderStatusRequest;
import com.pixelmart.order.exception.BadRequestException;
import com.pixelmart.order.exception.ResourceNotFoundException;
import com.pixelmart.order.repository.OrderItemRepository;
import com.pixelmart.order.repository.OrderRepository;
import com.pixelmart.order.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class AdminOrderService {

    private static final Set<String> ALLOWED_STATUSES = Set.of(
            "PENDING",
            "CONFIRMED",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED"
    );

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;

    public AdminOrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            PaymentRepository paymentRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> listAll() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public OrderResponse updateStatus(String id, UpdateOrderStatusRequest request) {
        String status = request.status().trim().toUpperCase();
        if (!ALLOWED_STATUSES.contains(status)) {
            throw new BadRequestException("Invalid order status: " + request.status());
        }
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        order.setStatus(status);
        return toResponse(orderRepository.save(order));
    }

    private OrderResponse toResponse(Order order) {
        var items = orderItemRepository.findByOrderIdOrderByCreatedAtAsc(order.getId());
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", order.getId()));
        return OrderResponse.from(order, items, payment);
    }
}
