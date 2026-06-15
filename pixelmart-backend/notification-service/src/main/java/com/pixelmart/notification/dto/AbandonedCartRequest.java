package com.pixelmart.notification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record AbandonedCartRequest(
        @NotBlank @Email String recipientEmail,
        @NotBlank String recipientName,
        @NotNull @Positive Integer itemCount,
        @NotNull BigDecimal subtotal,
        @NotBlank String currencyCode
) {
}
