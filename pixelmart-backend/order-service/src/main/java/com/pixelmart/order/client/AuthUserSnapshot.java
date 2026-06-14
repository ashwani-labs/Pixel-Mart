package com.pixelmart.order.client;

public record AuthUserSnapshot(
        String id,
        String email,
        String name
) {
}
