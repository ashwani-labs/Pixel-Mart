package com.pixelmart.order.controller;

import com.pixelmart.order.dto.CartDtos.AddCartItemRequest;
import com.pixelmart.order.dto.CartDtos.CartResponse;
import com.pixelmart.order.dto.CartDtos.UpdateCartItemRequest;
import com.pixelmart.order.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders/cart/items")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public CartResponse list(@RequestParam(required = false) String couponCode) {
        return cartService.getCart(couponCode);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CartResponse add(@Valid @RequestBody AddCartItemRequest request) {
        return cartService.addItem(request);
    }

    @PatchMapping("/{id}")
    public CartResponse update(@PathVariable String id, @Valid @RequestBody UpdateCartItemRequest request) {
        return cartService.updateItem(id, request);
    }

    @DeleteMapping("/{id}")
    public CartResponse remove(@PathVariable String id) {
        return cartService.removeItem(id);
    }
}
