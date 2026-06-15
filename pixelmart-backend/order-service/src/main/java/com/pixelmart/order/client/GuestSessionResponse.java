package com.pixelmart.order.client;

public record GuestSessionResponse(
        String userId,
        String email,
        String name,
        String accessToken,
        long expiresIn
) {
}
