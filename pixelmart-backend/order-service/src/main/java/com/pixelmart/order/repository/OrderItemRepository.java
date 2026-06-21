package com.pixelmart.order.repository;

import com.pixelmart.order.domain.OrderItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderItemRepository extends JpaRepository<OrderItem, String> {

  List<OrderItem> findByOrderIdOrderByCreatedAtAsc(String orderId);

  @Query(
      """
            SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END
            FROM OrderItem oi
            JOIN Order o ON o.id = oi.orderId
            WHERE o.userId = :userId
              AND o.status = 'DELIVERED'
              AND oi.productId = :productId
            """)
  boolean existsDeliveredPurchase(
      @Param("userId") String userId, @Param("productId") String productId);

  @Query(
      value =
          """
          SELECT oi2.product_id
          FROM order_items oi1
          INNER JOIN order_items oi2
            ON oi1.order_id = oi2.order_id AND oi2.product_id <> oi1.product_id
          WHERE oi1.product_id = :productId
          GROUP BY oi2.product_id
          ORDER BY COUNT(*) DESC
          LIMIT :limit
          """,
      nativeQuery = true)
  List<String> findFrequentlyBoughtTogetherProductIds(
      @Param("productId") String productId, @Param("limit") int limit);
}
