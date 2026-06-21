package com.pixelmart.notification.controller;

import com.pixelmart.notification.dto.EmailOutboxResponse;
import com.pixelmart.notification.dto.OrderConfirmationRequest;
import com.pixelmart.notification.dto.WhatsAppOrderStatusRequest;
import com.pixelmart.notification.service.OrderConfirmationEmailService;
import com.pixelmart.notification.service.OrderStatusWhatsAppService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/email")
public class OrderConfirmationController {

  private final OrderConfirmationEmailService emailService;
  private final OrderStatusWhatsAppService whatsAppService;

  public OrderConfirmationController(
      OrderConfirmationEmailService emailService, OrderStatusWhatsAppService whatsAppService) {
    this.emailService = emailService;
    this.whatsAppService = whatsAppService;
  }

  @PostMapping("/order-confirmation")
  @ResponseStatus(HttpStatus.CREATED)
  public EmailOutboxResponse orderConfirmation(
      @Valid @RequestBody OrderConfirmationRequest request) {
    EmailOutboxResponse response = emailService.sendOrderConfirmation(request);
    if (request.recipientPhone() != null && !request.recipientPhone().isBlank()) {
      whatsAppService.queueOrderStatus(
          new WhatsAppOrderStatusRequest(
              request.orderId(),
              request.orderNumber(),
              request.recipientPhone(),
              request.recipientName(),
              request.status(),
              request.grandTotal(),
              request.currencyCode()));
    }
    return response;
  }
}
