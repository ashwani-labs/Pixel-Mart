package com.pixelmart.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AnalyticsEventRequest(
    @NotBlank String eventType,
    @Size(max = 36) String productId,
    @Size(max = 64) String sessionId) {}
