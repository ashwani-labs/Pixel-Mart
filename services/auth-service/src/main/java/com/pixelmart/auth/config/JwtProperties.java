package com.pixelmart.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "pixelmart.jwt")
public record JwtProperties(
        String secret,
        long accessExpirationMs
) {
}
