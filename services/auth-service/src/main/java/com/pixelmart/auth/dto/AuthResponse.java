package com.pixelmart.auth.dto;

public record AuthResponse(
        String accessToken,
        long expiresIn,
        UserResponse user
) {
}
