package com.pixelmart.auth.dto;

/**
 * Access token in JSON body; refresh token is sent via HTTP-only cookie (see README).
 */
public record AuthTokens(
        AuthResponse auth,
        String refreshToken
) {
}
