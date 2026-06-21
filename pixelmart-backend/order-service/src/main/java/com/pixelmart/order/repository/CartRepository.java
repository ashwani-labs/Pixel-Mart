package com.pixelmart.order.repository;

import com.pixelmart.order.domain.Cart;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CartRepository extends JpaRepository<Cart, String> {

  Optional<Cart> findByUserId(String userId);

  @Query(
      """
            SELECT c FROM Cart c
            WHERE c.updatedAt < :cutoff
              AND c.abandonedCartEmailSentAt IS NULL
              AND EXISTS (SELECT 1 FROM CartItem ci WHERE ci.cartId = c.id)
            """)
  List<Cart> findAbandonedCarts(@Param("cutoff") Instant cutoff);
}
