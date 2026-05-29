package com.pixelmart.catalog.dto;

import com.pixelmart.catalog.domain.Product;
import com.pixelmart.catalog.domain.Review;
import com.pixelmart.catalog.domain.ReviewStatus;

import java.time.Instant;

public record ReviewResponse(
        String id,
        String productId,
        String productName,
        String reviewerName,
        int rating,
        String title,
        String body,
        ReviewStatus status,
        boolean verifiedPurchase,
        Instant createdAt
) {
    public static ReviewResponse fromPublic(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getProductId(),
                null,
                review.getReviewerName(),
                review.getRating(),
                review.getTitle(),
                review.getBody(),
                review.getStatus(),
                review.isVerifiedPurchase(),
                review.getCreatedAt()
        );
    }

    public static ReviewResponse fromAdmin(Review review, Product product) {
        return new ReviewResponse(
                review.getId(),
                review.getProductId(),
                product != null ? product.getName() : null,
                review.getReviewerName(),
                review.getRating(),
                review.getTitle(),
                review.getBody(),
                review.getStatus(),
                review.isVerifiedPurchase(),
                review.getCreatedAt()
        );
    }
}
