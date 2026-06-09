package com.pixelmart.order.controller;

import com.pixelmart.order.dto.CheckoutDtos.CheckoutRequest;
import com.pixelmart.order.dto.CheckoutDtos.OrderResponse;
import com.pixelmart.order.service.CheckoutIdempotencyService;
import com.pixelmart.order.service.CheckoutService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class CheckoutController {

    private final CheckoutIdempotencyService checkoutIdempotencyService;
    private final CheckoutService checkoutService;

    public CheckoutController(
            CheckoutIdempotencyService checkoutIdempotencyService,
            CheckoutService checkoutService
    ) {
        this.checkoutIdempotencyService = checkoutIdempotencyService;
        this.checkoutService = checkoutService;
    }

    @PostMapping("/checkout")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse checkout(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody CheckoutRequest request
    ) {
        return checkoutIdempotencyService.checkout(idempotencyKey, request);
    }

    @GetMapping
    public List<OrderResponse> list() {
        return checkoutService.listOrders();
    }

    @GetMapping("/{id}")
    public OrderResponse get(@PathVariable String id) {
        return checkoutService.getOrder(id);
    }
}
