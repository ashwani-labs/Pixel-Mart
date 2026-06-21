package com.pixelmart.catalog.repository;

import com.pixelmart.catalog.domain.ReviewImage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewImageRepository extends JpaRepository<ReviewImage, String> {

  List<ReviewImage> findByReviewIdOrderBySortOrderAsc(String reviewId);

  int countByReviewId(String reviewId);
}
