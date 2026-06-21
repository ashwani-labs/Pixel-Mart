package com.pixelmart.order.client;

import java.time.Instant;

public record AuthCustomerSnapshot(
    String id,
    String email,
    String name,
    boolean enabled,
    int loyaltyPoints,
    String referralCode,
    Instant createdAt) {}
