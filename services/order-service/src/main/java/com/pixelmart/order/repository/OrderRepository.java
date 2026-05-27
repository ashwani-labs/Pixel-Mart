package com.pixelmart.order.repository;

import com.pixelmart.order.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Order> findAllByOrderByCreatedAtDesc();

    Optional<Order> findByIdAndUserId(String id, String userId);
}
