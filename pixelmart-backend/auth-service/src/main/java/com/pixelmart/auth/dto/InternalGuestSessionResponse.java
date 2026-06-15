package com.pixelmart.auth.dto;

public record InternalGuestSessionResponse(
        String userId,
        String email,
        String name,
        String accessToken,
        long expiresIn
) {
}
