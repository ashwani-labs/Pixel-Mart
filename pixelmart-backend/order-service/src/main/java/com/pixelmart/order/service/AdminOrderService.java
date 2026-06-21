package com.pixelmart.order.service;

import com.pixelmart.order.client.NotificationClient;
import com.pixelmart.order.client.NotificationClient.WhatsAppOrderStatusPayload;
import com.pixelmart.order.domain.Order;
import com.pixelmart.order.domain.Payment;
import com.pixelmart.order.dto.CheckoutDtos.OrderResponse;
import com.pixelmart.order.dto.CheckoutDtos.UpdateOrderStatusRequest;
import com.pixelmart.order.exception.BadRequestException;
import com.pixelmart.order.exception.ResourceNotFoundException;
import com.pixelmart.order.repository.OrderItemRepository;
import com.pixelmart.order.repository.OrderRepository;
import com.pixelmart.order.repository.PaymentRepository;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminOrderService {

  private static final Set<String> ALLOWED_STATUSES =
      Set.of("PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED");

  private final OrderRepository orderRepository;
  private final OrderItemRepository orderItemRepository;
  private final PaymentRepository paymentRepository;
  private final NotificationClient notificationClient;

  public AdminOrderService(
      OrderRepository orderRepository,
      OrderItemRepository orderItemRepository,
      PaymentRepository paymentRepository,
      NotificationClient notificationClient) {
    this.orderRepository = orderRepository;
    this.orderItemRepository = orderItemRepository;
    this.paymentRepository = paymentRepository;
    this.notificationClient = notificationClient;
  }

  @Transactional(readOnly = true)
  public List<OrderResponse> listAll() {
    return orderRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
  }

  @Transactional
  public OrderResponse updateStatus(String id, UpdateOrderStatusRequest request) {
    String status = request.status().trim().toUpperCase();
    if (!ALLOWED_STATUSES.contains(status)) {
      throw new BadRequestException("Invalid order status: " + request.status());
    }
    Order order =
        orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order", id));
    order.setStatus(status);
    if ("SHIPPED".equals(status)
        && (order.getTrackingNumber() == null || order.getTrackingNumber().isBlank())) {
      order.setTrackingNumber("PMX" + order.getOrderNumber().substring(2));
    }
    Order saved = orderRepository.save(order);
    notificationClient.sendWhatsAppOrderStatus(
        new WhatsAppOrderStatusPayload(
            saved.getId(),
            saved.getOrderNumber(),
            saved.getShipToPhone(),
            saved.getShipToName(),
            saved.getStatus(),
            saved.getGrandTotal(),
            "INR"));
    return toResponse(saved);
  }

  private OrderResponse toResponse(Order order) {
    var items = orderItemRepository.findByOrderIdOrderByCreatedAtAsc(order.getId());
    Payment payment =
        paymentRepository
            .findByOrderId(order.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Payment", order.getId()));
    return OrderResponse.from(order, items, payment);
  }
}
