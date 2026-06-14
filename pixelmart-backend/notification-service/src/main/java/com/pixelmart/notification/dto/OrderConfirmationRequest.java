package com.pixelmart.notification.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record OrderConfirmationRequest(
        @NotBlank String orderId,
        @NotBlank String orderNumber,
        @NotBlank @Email String recipientEmail,
        @NotBlank String recipientName,
        @NotBlank String status,
        @NotNull BigDecimal grandTotal,
        String currencyCode,
        @NotEmpty @Valid List<OrderLine> items
) {
    public record OrderLine(
            @NotBlank String productName,
            int quantity,
            @NotNull BigDecimal lineTotal
    ) {
    }
}
