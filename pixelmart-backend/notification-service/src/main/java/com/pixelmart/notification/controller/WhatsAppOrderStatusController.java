package com.pixelmart.notification.controller;

import com.pixelmart.notification.dto.WhatsAppOrderStatusRequest;
import com.pixelmart.notification.dto.WhatsAppOutboxResponse;
import com.pixelmart.notification.service.OrderStatusWhatsAppService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications/whatsapp")
public class WhatsAppOrderStatusController {

  private final OrderStatusWhatsAppService whatsAppService;

  public WhatsAppOrderStatusController(OrderStatusWhatsAppService whatsAppService) {
    this.whatsAppService = whatsAppService;
  }

  @PostMapping("/order-status")
  @ResponseStatus(HttpStatus.CREATED)
  public WhatsAppOutboxResponse orderStatus(@Valid @RequestBody WhatsAppOrderStatusRequest request) {
    return whatsAppService.queueOrderStatus(request);
  }
}
