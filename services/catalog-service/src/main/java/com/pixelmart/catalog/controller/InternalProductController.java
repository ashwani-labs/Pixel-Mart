package com.pixelmart.catalog.controller;

import com.pixelmart.catalog.dto.InternalProductResponse;
import com.pixelmart.catalog.dto.InternalStockRequests.ReserveStockRequest;
import com.pixelmart.catalog.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog/internal/products")
public class InternalProductController {

    private final ProductService productService;

    public InternalProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/{id}")
    public InternalProductResponse getById(
            @PathVariable String id,
            @RequestParam(required = false) String couponCode
    ) {
        return productService.getInternalById(id, couponCode);
    }

    @PostMapping("/reserve-stock")
    public void reserveStock(@Valid @RequestBody ReserveStockRequest request) {
        productService.reserveStock(request);
    }
}
