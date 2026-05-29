package com.pixelmart.catalog.controller;

import com.pixelmart.catalog.dto.ReviewRequests.SubmitReviewRequest;
import com.pixelmart.catalog.dto.ReviewResponse;
import com.pixelmart.catalog.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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
}
