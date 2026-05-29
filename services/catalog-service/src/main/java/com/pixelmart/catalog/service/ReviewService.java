package com.pixelmart.catalog.service;

import com.pixelmart.catalog.client.AuthClient;
import com.pixelmart.catalog.client.AuthUserSnapshot;
import com.pixelmart.catalog.client.OrderClient;
import com.pixelmart.catalog.domain.Product;
import com.pixelmart.catalog.domain.Review;
import com.pixelmart.catalog.domain.ReviewStatus;
import com.pixelmart.catalog.dto.PageResponse;
import com.pixelmart.catalog.dto.ReviewRequests.ModerateReviewRequest;
import com.pixelmart.catalog.dto.ReviewRequests.SubmitReviewRequest;
import com.pixelmart.catalog.dto.ReviewResponse;
import com.pixelmart.catalog.exception.BadRequestException;
import com.pixelmart.catalog.exception.ConflictException;
import com.pixelmart.catalog.exception.ResourceNotFoundException;
import com.pixelmart.catalog.repository.ProductRepository;
import com.pixelmart.catalog.repository.ReviewRepository;
import com.pixelmart.catalog.security.CurrentUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final OrderClient orderClient;
    private final AuthClient authClient;

    public ReviewService(
            ReviewRepository reviewRepository,
            ProductRepository productRepository,
            ProductService productService,
            OrderClient orderClient,
            AuthClient authClient
    ) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.productService = productService;
        this.orderClient = orderClient;
        this.authClient = authClient;
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> listApprovedForProduct(String productId) {
        productService.findProduct(productId);
        return reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(productId, ReviewStatus.APPROVED).stream()
                .map(ReviewResponse::fromPublic)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReviewResponse getCurrentUserReview(String productId) {
        String userId = CurrentUser.requireUserId();
        return reviewRepository.findByUserIdAndProductId(userId, productId)
                .map(ReviewResponse::fromPublic)
                .orElse(null);
    }

    @Transactional
    public ReviewResponse submit(SubmitReviewRequest request) {
        String userId = CurrentUser.requireUserId();
        Product product = productService.findProduct(request.productId());
        if (!product.isVisible()) {
            throw new BadRequestException("Product is not available for review");
        }
        if (reviewRepository.findByUserIdAndProductId(userId, request.productId()).isPresent()) {
            throw new ConflictException("You have already reviewed this product");
        }
        if (!orderClient.hasDeliveredPurchase(userId, request.productId())) {
            throw new BadRequestException("Only customers with a delivered order can review this product");
        }

        AuthUserSnapshot user = authClient.getUser(userId);
        Review review = new Review();
        review.setProductId(request.productId());
        review.setUserId(userId);
        review.setReviewerName(user.name());
        review.setRating(request.rating());
        review.setTitle(normalize(request.title()));
        review.setBody(request.body().trim());
        review.setStatus(ReviewStatus.PENDING);
        review.setVerifiedPurchase(true);
        return ReviewResponse.fromPublic(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> listAdmin(String status, Pageable pageable) {
        Page<Review> page;
        if (status == null || status.isBlank()) {
            page = reviewRepository.findAllByOrderByCreatedAtDesc(pageable);
        } else {
            ReviewStatus reviewStatus = parseModerationStatus(status);
            page = reviewRepository.findByStatusOrderByCreatedAtDesc(reviewStatus, pageable);
        }

        Map<String, Product> productsById = productRepository.findAllById(
                page.getContent().stream().map(Review::getProductId).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(Product::getId, Function.identity()));

        List<ReviewResponse> content = page.getContent().stream()
                .map(review -> ReviewResponse.fromAdmin(review, productsById.get(review.getProductId())))
                .toList();
        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Transactional
    public ReviewResponse moderate(String id, ModerateReviewRequest request) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));
        ReviewStatus nextStatus = parseModerationStatus(request.status());
        if (nextStatus == ReviewStatus.PENDING) {
            throw new BadRequestException("Moderation status must be APPROVED or REJECTED");
        }
        review.setStatus(nextStatus);
        Product product = productRepository.findById(review.getProductId()).orElse(null);
        return ReviewResponse.fromAdmin(reviewRepository.save(review), product);
    }

    private ReviewStatus parseModerationStatus(String status) {
        try {
            return ReviewStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid review status: " + status);
        }
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
