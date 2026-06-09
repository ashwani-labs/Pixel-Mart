package com.pixelmart.catalog.controller;

import com.pixelmart.catalog.dto.CartDiscountDtos.CartDiscountRequest;
import com.pixelmart.catalog.dto.CartDiscountDtos.CartDiscountResponse;
import com.pixelmart.catalog.service.OfferService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog/internal/offers")
public class InternalOfferController {

    private final OfferService offerService;

    public InternalOfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @PostMapping("/cart-discount")
    public CartDiscountResponse cartDiscount(@Valid @RequestBody CartDiscountRequest request) {
        return CartDiscountResponse.from(offerService.cartDiscount(request.subtotal(), request.couponCode()));
    }
}
