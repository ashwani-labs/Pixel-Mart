package com.pixelmart.notification.controller;

import com.pixelmart.notification.dto.AbandonedCartRequest;
import com.pixelmart.notification.dto.EmailOutboxResponse;
import com.pixelmart.notification.service.AbandonedCartEmailService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/email")
public class AbandonedCartController {

    private final AbandonedCartEmailService emailService;

    public AbandonedCartController(AbandonedCartEmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/abandoned-cart")
    @ResponseStatus(HttpStatus.CREATED)
    public EmailOutboxResponse abandonedCart(@Valid @RequestBody AbandonedCartRequest request) {
        return emailService.queue(request);
    }
}
