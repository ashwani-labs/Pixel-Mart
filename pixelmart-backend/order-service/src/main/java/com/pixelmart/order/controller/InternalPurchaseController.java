package com.pixelmart.order.controller;

import com.pixelmart.order.service.PurchaseVerificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders/internal")
public class InternalPurchaseController {

    private final PurchaseVerificationService purchaseVerificationService;

    public InternalPurchaseController(PurchaseVerificationService purchaseVerificationService) {
        this.purchaseVerificationService = purchaseVerificationService;
    }

    @GetMapping("/purchase-verification")
    public PurchaseVerificationResponse verify(
            @RequestParam String userId,
            @RequestParam String productId
    ) {
        return new PurchaseVerificationResponse(
                purchaseVerificationService.hasDeliveredPurchase(userId, productId)
        );
    }

    public record PurchaseVerificationResponse(boolean verified) {
    }
}
