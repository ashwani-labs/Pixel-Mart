package com.pixelmart.order.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "pixelmart.razorpay")
public record RazorpayProperties(String keyId, String keySecret) {

  public boolean isEnabled() {
    return keyId != null && !keyId.isBlank() && keySecret != null && !keySecret.isBlank();
  }
}
