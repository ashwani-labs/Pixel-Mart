package com.pixelmart.order.repository;

import com.pixelmart.order.domain.Order;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, String> {

  List<Order> findByUserIdOrderByCreatedAtDesc(String userId);

  List<Order> findAllByOrderByCreatedAtDesc();

  Optional<Order> findByIdAndUserId(String id, String userId);

  long countByCreatedAtGreaterThanEqual(Instant createdAt);

  @Query("SELECT COALESCE(SUM(o.grandTotal), 0) FROM Order o WHERE o.createdAt >= :since")
  BigDecimal sumGrandTotalSince(@Param("since") Instant since);

  List<Order> findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(Instant since);

  long countByCreatedAtGreaterThanEqualAndCouponCodeIsNotNull(Instant since);

  @Query(
      value =
          """
          SELECT payment_method, COUNT(*), COALESCE(SUM(grand_total), 0)
          FROM orders
          WHERE created_at >= :since
          GROUP BY payment_method
          ORDER BY COUNT(*) DESC
          """,
      nativeQuery = true)
  List<Object[]> paymentMethodBreakdownSince(@Param("since") Instant since);

  @Query(
      value =
          """
          SELECT coupon_code, COUNT(*), COALESCE(SUM(discount_total), 0)
          FROM orders
          WHERE created_at >= :since AND coupon_code IS NOT NULL
          GROUP BY coupon_code
          ORDER BY COUNT(*) DESC
          LIMIT :limit
          """,
      nativeQuery = true)
  List<Object[]> topCouponsSince(@Param("since") Instant since, @Param("limit") int limit);

  @Query("SELECT o.userId, COUNT(o) FROM Order o GROUP BY o.userId")
  List<Object[]> countOrdersByUser();
}
