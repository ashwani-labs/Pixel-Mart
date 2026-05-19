package com.pixelmart.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "pixelmart.jwt")
public record GatewayJwtProperties(String secret) {
}
