package com.pixelmart.order.repository;

import com.pixelmart.order.domain.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, String> {

    List<OrderItem> findByOrderIdOrderByCreatedAtAsc(String orderId);
}
