package com.pixelmart.catalog.service;

import com.pixelmart.catalog.domain.Review;
import com.pixelmart.catalog.domain.ReviewImage;
import com.pixelmart.catalog.exception.BadRequestException;
import com.pixelmart.catalog.exception.ResourceNotFoundException;
import com.pixelmart.catalog.repository.ReviewImageRepository;
import com.pixelmart.catalog.repository.ReviewRepository;
import com.pixelmart.catalog.storage.StorageService;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ReviewImageService {

  private static final int MAX_IMAGES_PER_REVIEW = 5;

  private final ReviewImageRepository reviewImageRepository;
  private final ReviewRepository reviewRepository;
  private final StorageService storageService;
  private final MediaUrlService mediaUrlService;

  public ReviewImageService(
      ReviewImageRepository reviewImageRepository,
      ReviewRepository reviewRepository,
      StorageService storageService,
      MediaUrlService mediaUrlService) {
    this.reviewImageRepository = reviewImageRepository;
    this.reviewRepository = reviewRepository;
    this.storageService = storageService;
    this.mediaUrlService = mediaUrlService;
  }

  @Transactional
  public List<String> uploadImages(String reviewId, String userId, List<MultipartFile> files) {
    Review review =
        reviewRepository
            .findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));
    if (!review.getUserId().equals(userId)) {
      throw new BadRequestException("Review does not belong to current user");
    }
    if (files == null || files.isEmpty()) {
      return List.of();
    }
    int existing = reviewImageRepository.countByReviewId(reviewId);
    if (existing + files.size() > MAX_IMAGES_PER_REVIEW) {
      throw new BadRequestException("Maximum " + MAX_IMAGES_PER_REVIEW + " images per review");
    }

    List<String> urls = new ArrayList<>();
    int sortOrder = existing;
    for (MultipartFile file : files) {
      if (file == null || file.isEmpty()) {
        continue;
      }
      StorageService.StoredObject stored =
          storageService.store("review-images/" + reviewId, file);
      ReviewImage image = new ReviewImage();
      image.setReviewId(reviewId);
      image.setStorageKey(stored.storageKey());
      image.setSortOrder(sortOrder++);
      ReviewImage saved = reviewImageRepository.save(image);
      urls.add(mediaUrlService.reviewImageUrl(saved.getId()));
    }
    return urls;
  }

  @Transactional(readOnly = true)
  public List<String> listImageUrls(String reviewId) {
    return reviewImageRepository.findByReviewIdOrderBySortOrderAsc(reviewId).stream()
        .map(image -> mediaUrlService.reviewImageUrl(image.getId()))
        .toList();
  }

  @Transactional(readOnly = true)
  public ProductImageService.MediaResource getReviewImage(String imageId) {
    ReviewImage image =
        reviewImageRepository
            .findById(imageId)
            .orElseThrow(() -> new ResourceNotFoundException("ReviewImage", imageId));
    try {
      StorageService.StoredContent content = storageService.load(image.getStorageKey());
      return new ProductImageService.MediaResource(content.resource(), content.contentType());
    } catch (BadRequestException ex) {
      throw new ResourceNotFoundException("Media", imageId);
    }
  }
}
