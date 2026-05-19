package com.pixelmart.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "pixelmart.auth.cookie")
public record AuthCookieProperties(
        String refreshName,
        boolean secure,
        String sameSite,
        String path
) {
}
