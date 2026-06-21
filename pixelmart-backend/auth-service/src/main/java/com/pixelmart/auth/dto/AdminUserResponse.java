package com.pixelmart.auth.dto;

import java.time.Instant;

public record AdminUserResponse(
    String id,
    String email,
    String name,
    boolean enabled,
    int loyaltyPoints,
    String referralCode,
    Instant createdAt) {}
