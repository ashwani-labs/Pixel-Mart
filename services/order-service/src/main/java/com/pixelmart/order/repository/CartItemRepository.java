package com.pixelmart.order.repository;

import com.pixelmart.order.domain.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, String> {

    List<CartItem> findByCartIdOrderByCreatedAtAsc(String cartId);

    Optional<CartItem> findByIdAndCartId(String id, String cartId);

    Optional<CartItem> findByCartIdAndProductId(String cartId, String productId);

    int countByCartId(String cartId);
}
