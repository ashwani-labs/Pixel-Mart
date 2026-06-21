package com.pixelmart.order.dto;

import jakarta.validation.constraints.NotBlank;

public record RazorpayVerifyRequest(
    @NotBlank String orderId,
    @NotBlank String razorpayPaymentId,
    @NotBlank String razorpayOrderId,
    @NotBlank String razorpaySignature) {}
