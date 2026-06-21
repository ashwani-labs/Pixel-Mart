package com.pixelmart.order.service;

import com.pixelmart.order.client.AuthAdminClient;
import com.pixelmart.order.client.AuthCustomerPageResponse;
import com.pixelmart.order.client.AuthCustomerSnapshot;
import com.pixelmart.order.dto.AdminCustomerResponse;
import com.pixelmart.order.dto.PageResponse;
import com.pixelmart.order.repository.OrderRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminCustomerService {

  private final AuthAdminClient authAdminClient;
  private final OrderRepository orderRepository;

  public AdminCustomerService(AuthAdminClient authAdminClient, OrderRepository orderRepository) {
    this.authAdminClient = authAdminClient;
    this.orderRepository = orderRepository;
  }

  @Transactional(readOnly = true)
  public PageResponse<AdminCustomerResponse> listCustomers(Pageable pageable) {
    AuthCustomerPageResponse authPage =
        authAdminClient.listCustomers(pageable.getPageNumber(), pageable.getPageSize());
    Map<String, Long> orderCounts =
        orderRepository.countOrdersByUser().stream()
            .collect(
                Collectors.toMap(
                    row -> String.valueOf(row[0]), row -> ((Number) row[1]).longValue()));
    List<AdminCustomerResponse> content =
        authPage.content().stream()
            .map(customer -> toResponse(customer, orderCounts))
            .toList();
    return new PageResponse<>(
        content,
        authPage.page(),
        authPage.size(),
        authPage.totalElements(),
        authPage.totalPages(),
        authPage.last());
  }

  private AdminCustomerResponse toResponse(
      AuthCustomerSnapshot customer, Map<String, Long> orderCounts) {
    return new AdminCustomerResponse(
        customer.id(),
        customer.email(),
        customer.name(),
        customer.enabled(),
        customer.loyaltyPoints(),
        customer.referralCode(),
        customer.createdAt(),
        orderCounts.getOrDefault(customer.id(), 0L));
  }
}
