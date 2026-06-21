package com.pixelmart.catalog.controller;

import com.pixelmart.catalog.dto.HeroSlideDtos.HeroSlidesResponse;
import com.pixelmart.catalog.dto.HeroSlideDtos.UpdateHeroSlidesRequest;
import com.pixelmart.catalog.service.HeroSlideService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/settings/hero-slides")
public class AdminHeroSlideController {

  private final HeroSlideService heroSlideService;

  public AdminHeroSlideController(HeroSlideService heroSlideService) {
    this.heroSlideService = heroSlideService;
  }

  @GetMapping
  public HeroSlidesResponse get() {
    return heroSlideService.getAdmin();
  }

  @PutMapping
  public HeroSlidesResponse update(@Valid @RequestBody UpdateHeroSlidesRequest request) {
    return heroSlideService.update(request);
  }
}
