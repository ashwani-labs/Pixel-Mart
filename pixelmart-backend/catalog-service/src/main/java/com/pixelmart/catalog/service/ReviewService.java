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
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ReviewService {

  private final ReviewRepository reviewRepository;
  private final ProductRepository productRepository;
  private final ProductService productService;
  private final OrderClient orderClient;
  private final AuthClient authClient;
  private final AuditLogService auditLogService;
  private final ReviewImageService reviewImageService;

  public ReviewService(
      ReviewRepository reviewRepository,
      ProductRepository productRepository,
      ProductService productService,
      OrderClient orderClient,
      AuthClient authClient,
      AuditLogService auditLogService,
      ReviewImageService reviewImageService) {
    this.reviewRepository = reviewRepository;
    this.productRepository = productRepository;
    this.productService = productService;
    this.orderClient = orderClient;
    this.authClient = authClient;
    this.auditLogService = auditLogService;
    this.reviewImageService = reviewImageService;
  }

  @Transactional(readOnly = true)
  public List<ReviewResponse> listApprovedForProduct(String productId) {
    productService.findProduct(productId);
    return reviewRepository
        .findByProductIdAndStatusOrderByCreatedAtDesc(productId, ReviewStatus.APPROVED)
        .stream()
        .map(review -> toPublicResponse(review))
        .toList();
  }

  @Transactional(readOnly = true)
  public ReviewResponse getCurrentUserReview(String productId) {
    String userId = CurrentUser.requireUserId();
    return reviewRepository
        .findByUserIdAndProductId(userId, productId)
        .map(this::toPublicResponse)
        .orElse(null);
  }

  @Transactional
  public ReviewResponse submit(SubmitReviewRequest request) {
    return submit(request, List.of());
  }

  @Transactional
  public ReviewResponse submit(SubmitReviewRequest request, List<MultipartFile> images) {
    String userId = CurrentUser.requireUserId();
    Product product = productService.findProduct(request.productId());
    if (!product.isVisible()) {
      throw new BadRequestException("Product is not available for review");
    }
    if (reviewRepository.findByUserIdAndProductId(userId, request.productId()).isPresent()) {
      throw new ConflictException("You have already reviewed this product");
    }
    if (!orderClient.hasDeliveredPurchase(userId, request.productId())) {
      throw new BadRequestException(
          "Only customers with a delivered order can review this product");
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
    Review saved = reviewRepository.save(review);
    reviewImageService.uploadImages(saved.getId(), userId, images);
    return toPublicResponse(saved);
  }

  @Transactional
  public ReviewResponse addImages(String reviewId, List<MultipartFile> images) {
    String userId = CurrentUser.requireUserId();
    Review review =
        reviewRepository
            .findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));
    reviewImageService.uploadImages(reviewId, userId, images);
    return toPublicResponse(review);
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

    Map<String, Product> productsById =
        productRepository
            .findAllById(
                page.getContent().stream().map(Review::getProductId).collect(Collectors.toSet()))
            .stream()
            .collect(Collectors.toMap(Product::getId, Function.identity()));

    List<ReviewResponse> content =
        page.getContent().stream()
            .map(
                review ->
                    ReviewResponse.fromAdmin(
                        review,
                        productsById.get(review.getProductId()),
                        reviewImageService.listImageUrls(review.getId())))
            .toList();
    return new PageResponse<>(
        content,
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages(),
        page.isLast());
  }

  @Transactional
  public ReviewResponse moderate(String id, ModerateReviewRequest request) {
    Review review =
        reviewRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Review", id));
    ReviewStatus nextStatus = parseModerationStatus(request.status());
    if (nextStatus == ReviewStatus.PENDING) {
      throw new BadRequestException("Moderation status must be APPROVED or REJECTED");
    }
    ReviewStatus previousStatus = review.getStatus();
    review.setStatus(nextStatus);
    Product product = productRepository.findById(review.getProductId()).orElse(null);
    Review saved = reviewRepository.save(review);
    auditLogService.log(
        "REVIEW_MODERATED",
        "review",
        id,
        Map.of("status", previousStatus.name()),
        Map.of("status", saved.getStatus().name()));
    return ReviewResponse.fromAdmin(
        saved, product, reviewImageService.listImageUrls(saved.getId()));
  }

  private ReviewResponse toPublicResponse(Review review) {
    return ReviewResponse.fromPublic(review, reviewImageService.listImageUrls(review.getId()));
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
