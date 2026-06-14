package com.pixelmart.catalog.controller;

import com.pixelmart.catalog.dto.ProductResponse;
import com.pixelmart.catalog.dto.WishlistRequests.ToggleWishlistRequest;
import com.pixelmart.catalog.service.WishlistService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/catalog/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public List<ProductResponse> list() {
        return wishlistService.listCurrentUserWishlist();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void add(@Valid @RequestBody ToggleWishlistRequest request) {
        wishlistService.addToWishlist(request.productId());
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@Valid @RequestBody ToggleWishlistRequest request) {
        wishlistService.removeFromWishlist(request.productId());
    }
}
