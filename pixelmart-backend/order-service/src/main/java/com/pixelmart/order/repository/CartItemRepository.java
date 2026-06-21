package com.pixelmart.order.repository;

import com.pixelmart.order.domain.CartItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CartItemRepository extends JpaRepository<CartItem, String> {

  List<CartItem> findByCartIdOrderByCreatedAtAsc(String cartId);

  Optional<CartItem> findByIdAndCartId(String id, String cartId);

  Optional<CartItem> findByCartIdAndProductId(String cartId, String productId);

  @Query(
      """
      SELECT c FROM CartItem c
      WHERE c.cartId = :cartId AND c.productId = :productId
        AND ((:variantId IS NULL AND c.variantId IS NULL) OR c.variantId = :variantId)
      """)
  Optional<CartItem> findByCartIdAndProductIdAndVariantId(
      @Param("cartId") String cartId,
      @Param("productId") String productId,
      @Param("variantId") String variantId);

  int countByCartId(String cartId);

  void deleteByCartId(String cartId);
}
