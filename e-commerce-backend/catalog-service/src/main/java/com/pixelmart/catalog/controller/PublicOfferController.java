package com.pixelmart.catalog.controller;

import com.pixelmart.catalog.dto.OfferResponse;
import com.pixelmart.catalog.service.OfferService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/catalog/offers")
public class PublicOfferController {

    private final OfferService offerService;

    public PublicOfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @GetMapping("/active")
    public List<OfferResponse> activeOffers() {
        return offerService.listActiveAutomatic();
    }
}
