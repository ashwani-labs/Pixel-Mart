package com.pixelmart.catalog.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class ReviewRequests {

    private ReviewRequests() {
    }

    public record SubmitReviewRequest(
            @NotBlank String productId,
            @NotNull @Min(1) @Max(5) Integer rating,
            @Size(max = 255) String title,
            @NotBlank @Size(max = 2000) String body
    ) {
    }

    public record ModerateReviewRequest(
            @NotBlank String status
    ) {
    }
}
