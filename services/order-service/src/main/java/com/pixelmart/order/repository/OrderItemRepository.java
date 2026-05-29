package com.pixelmart.order.repository;

import com.pixelmart.order.domain.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderItemRepository extends JpaRepository<OrderItem, String> {

    List<OrderItem> findByOrderIdOrderByCreatedAtAsc(String orderId);

    @Query("""
            SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END
            FROM OrderItem oi
            JOIN Order o ON o.id = oi.orderId
            WHERE o.userId = :userId
              AND o.status = 'DELIVERED'
              AND oi.productId = :productId
            """)
    boolean existsDeliveredPurchase(@Param("userId") String userId, @Param("productId") String productId);
}
