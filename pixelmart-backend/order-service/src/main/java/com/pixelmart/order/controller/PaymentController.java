package com.pixelmart.order.controller;

import com.pixelmart.order.dto.CheckoutDtos.OrderResponse;
import com.pixelmart.order.dto.PaymentConfigResponse;
import com.pixelmart.order.dto.RazorpayVerifyRequest;
import com.pixelmart.order.service.CheckoutService;
import com.pixelmart.order.service.RazorpayPaymentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders/payments")
public class PaymentController {

  private final RazorpayPaymentService razorpayPaymentService;
  private final CheckoutService checkoutService;

  public PaymentController(
      RazorpayPaymentService razorpayPaymentService, CheckoutService checkoutService) {
    this.razorpayPaymentService = razorpayPaymentService;
    this.checkoutService = checkoutService;
  }

  @GetMapping("/config")
  public PaymentConfigResponse config() {
    return new PaymentConfigResponse(
        razorpayPaymentService.isEnabled(), razorpayPaymentService.keyId());
  }

  @PostMapping("/razorpay/verify")
  public OrderResponse verifyRazorpay(@Valid @RequestBody RazorpayVerifyRequest request) {
    return checkoutService.confirmRazorpayPayment(
        request.orderId(),
        request.razorpayOrderId(),
        request.razorpayPaymentId(),
        request.razorpaySignature());
  }
}
