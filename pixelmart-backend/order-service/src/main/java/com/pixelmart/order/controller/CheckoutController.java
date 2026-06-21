package com.pixelmart.order.controller;

import com.pixelmart.order.dto.CheckoutDtos.CheckoutRequest;
import com.pixelmart.order.dto.CheckoutDtos.GuestCheckoutRequest;
import com.pixelmart.order.dto.CheckoutDtos.GuestCheckoutResponse;
import com.pixelmart.order.dto.CheckoutDtos.OrderResponse;
import com.pixelmart.order.service.CheckoutIdempotencyService;
import com.pixelmart.order.service.CheckoutService;
import com.pixelmart.order.service.GuestCheckoutService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class CheckoutController {

  private final CheckoutIdempotencyService checkoutIdempotencyService;
  private final CheckoutService checkoutService;
  private final GuestCheckoutService guestCheckoutService;

  public CheckoutController(
      CheckoutIdempotencyService checkoutIdempotencyService,
      CheckoutService checkoutService,
      GuestCheckoutService guestCheckoutService) {
    this.checkoutIdempotencyService = checkoutIdempotencyService;
    this.checkoutService = checkoutService;
    this.guestCheckoutService = guestCheckoutService;
  }

  @PostMapping("/guest-checkout")
  @ResponseStatus(HttpStatus.CREATED)
  public GuestCheckoutResponse guestCheckout(@Valid @RequestBody GuestCheckoutRequest request) {
    return guestCheckoutService.checkout(request);
  }

  @PostMapping("/checkout")
  @ResponseStatus(HttpStatus.CREATED)
  public OrderResponse checkout(
      @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
      @Valid @RequestBody CheckoutRequest request) {
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
