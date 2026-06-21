package com.pixelmart.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record WhatsAppOrderStatusRequest(
    @NotBlank String orderId,
    @NotBlank String orderNumber,
    @NotBlank String recipientPhone,
    @NotBlank String recipientName,
    @NotBlank String status,
    @NotNull BigDecimal grandTotal,
    String currencyCode) {}
