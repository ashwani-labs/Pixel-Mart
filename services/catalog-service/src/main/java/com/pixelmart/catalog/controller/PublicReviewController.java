package com.pixelmart.catalog.controller;

import com.pixelmart.catalog.dto.ReviewResponse;
import com.pixelmart.catalog.service.ReviewService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/catalog/products")
public class PublicReviewController {

    private final ReviewService reviewService;

    public PublicReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/{productId}/reviews")
    public List<ReviewResponse> listApproved(@PathVariable String productId) {
        return reviewService.listApprovedForProduct(productId);
    }
}
