package com.pixelmart.auth.dto;

public record InternalUserResponse(
        String id,
        String email,
        String name
) {
}
