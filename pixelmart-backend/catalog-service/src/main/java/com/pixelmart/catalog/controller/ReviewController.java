package com.pixelmart.catalog.controller;

import com.pixelmart.catalog.dto.ReviewRequests.SubmitReviewRequest;
import com.pixelmart.catalog.dto.ReviewResponse;
import com.pixelmart.catalog.service.ReviewService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/catalog/reviews")
public class ReviewController {

  private final ReviewService reviewService;

  public ReviewController(ReviewService reviewService) {
    this.reviewService = reviewService;
  }

  @GetMapping("/me")
  public ReviewResponse myReview(@RequestParam String productId) {
    return reviewService.getCurrentUserReview(productId);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ReviewResponse submit(@Valid @RequestBody SubmitReviewRequest request) {
    return reviewService.submit(request);
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public ReviewResponse submitWithImages(
      @RequestParam @NotBlank String productId,
      @RequestParam @Min(1) @Max(5) int rating,
      @RequestParam(required = false) @Size(max = 255) String title,
      @RequestParam @NotBlank @Size(max = 2000) String body,
      @RequestPart(required = false) List<MultipartFile> images) {
    SubmitReviewRequest request = new SubmitReviewRequest(productId, rating, title, body);
    return reviewService.submit(request, images != null ? images : List.of());
  }

  @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public ReviewResponse addImages(
      @PathVariable String id, @RequestPart("files") List<MultipartFile> files) {
    return reviewService.addImages(id, files);
  }
}
