package com.pixelmart.catalog.controller;

import com.pixelmart.catalog.dto.PageResponse;
import com.pixelmart.catalog.dto.ReviewRequests.ModerateReviewRequest;
import com.pixelmart.catalog.dto.ReviewResponse;
import com.pixelmart.catalog.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reviews")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReviewController {

    private final ReviewService reviewService;

    public AdminReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public PageResponse<ReviewResponse> list(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return reviewService.listAdmin(status, pageable);
    }

    @PatchMapping("/{id}/status")
    public ReviewResponse moderate(
            @PathVariable String id,
            @Valid @RequestBody ModerateReviewRequest request
    ) {
        return reviewService.moderate(id, request);
    }
}
