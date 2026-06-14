package com.pixelmart.catalog.repository;

import com.pixelmart.catalog.domain.Review;
import com.pixelmart.catalog.domain.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, String> {

    List<Review> findByProductIdAndStatusOrderByCreatedAtDesc(String productId, ReviewStatus status);

    Optional<Review> findByUserIdAndProductId(String userId, String productId);

    Page<Review> findByStatusOrderByCreatedAtDesc(ReviewStatus status, Pageable pageable);

    Page<Review> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
