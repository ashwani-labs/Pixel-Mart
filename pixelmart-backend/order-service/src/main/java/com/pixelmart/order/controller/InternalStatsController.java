package com.pixelmart.order.controller;

import com.pixelmart.order.repository.OrderRepository;
import java.time.Instant;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders/internal/stats")
public class InternalStatsController {

  private final OrderRepository orderRepository;

  public InternalStatsController(OrderRepository orderRepository) {
    this.orderRepository = orderRepository;
  }

  @GetMapping("/order-count")
  public OrderCountResponse orderCount(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant since) {
    return new OrderCountResponse(orderRepository.countByCreatedAtGreaterThanEqual(since));
  }

  public record OrderCountResponse(long count) {}
}
