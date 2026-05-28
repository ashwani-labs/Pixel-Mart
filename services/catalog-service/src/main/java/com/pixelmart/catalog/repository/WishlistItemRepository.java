package com.pixelmart.catalog.repository;

import com.pixelmart.catalog.domain.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, String> {

    List<WishlistItem> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<WishlistItem> findByUserIdAndProductId(String userId, String productId);

    List<WishlistItem> findByUserIdAndProductIdIn(String userId, List<String> productIds);
}
