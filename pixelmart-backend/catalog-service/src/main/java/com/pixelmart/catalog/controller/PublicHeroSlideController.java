package com.pixelmart.catalog.controller;

import com.pixelmart.catalog.dto.HeroSlideDtos.HeroSlidesResponse;
import com.pixelmart.catalog.dto.HeroSlideDtos.UpdateHeroSlidesRequest;
import com.pixelmart.catalog.service.HeroSlideService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/catalog/hero-slides")
public class PublicHeroSlideController {

    private final HeroSlideService heroSlideService;

    public PublicHeroSlideController(HeroSlideService heroSlideService) {
        this.heroSlideService = heroSlideService;
    }

    @GetMapping
    public HeroSlidesResponse list() {
        return heroSlideService.getPublic();
    }
}
