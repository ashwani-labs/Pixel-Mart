package com.pixelmart.order.dto;

import java.time.Instant;

public record AdminCustomerResponse(
    String id,
    String email,
    String name,
    boolean enabled,
    int loyaltyPoints,
    String referralCode,
    Instant createdAt,
    long orderCount) {}
