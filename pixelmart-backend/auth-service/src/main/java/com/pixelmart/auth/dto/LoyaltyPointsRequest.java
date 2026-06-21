package com.pixelmart.auth.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record LoyaltyPointsRequest(@NotNull @Min(1) Integer points) {}
