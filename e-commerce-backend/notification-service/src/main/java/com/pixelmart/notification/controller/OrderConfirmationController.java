package com.pixelmart.notification.controller;

import com.pixelmart.notification.dto.EmailOutboxResponse;
import com.pixelmart.notification.dto.OrderConfirmationRequest;
import com.pixelmart.notification.service.OrderConfirmationEmailService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/email")
public class OrderConfirmationController {

    private final OrderConfirmationEmailService emailService;

    public OrderConfirmationController(OrderConfirmationEmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/order-confirmation")
    @ResponseStatus(HttpStatus.CREATED)
    public EmailOutboxResponse orderConfirmation(@Valid @RequestBody OrderConfirmationRequest request) {
        return emailService.sendOrderConfirmation(request);
    }
}
