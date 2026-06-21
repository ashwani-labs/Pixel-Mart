package com.pixelmart.order.controller;

import com.pixelmart.order.dto.FrequentlyBoughtTogetherResponse;
import com.pixelmart.order.service.FrequentlyBoughtTogetherService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders/products")
public class PublicProductInsightsController {

  private final FrequentlyBoughtTogetherService frequentlyBoughtTogetherService;

  public PublicProductInsightsController(
      FrequentlyBoughtTogetherService frequentlyBoughtTogetherService) {
    this.frequentlyBoughtTogetherService = frequentlyBoughtTogetherService;
  }

  @GetMapping("/{productId}/frequently-bought-together")
  public FrequentlyBoughtTogetherResponse frequentlyBoughtTogether(
      @PathVariable String productId,
      @RequestParam(defaultValue = "4") int limit) {
    int cappedLimit = Math.min(Math.max(limit, 1), 8);
    return frequentlyBoughtTogetherService.suggest(productId, cappedLimit);
  }
}
