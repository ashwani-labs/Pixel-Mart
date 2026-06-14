package com.pixelmart.catalog.service;

import com.pixelmart.catalog.domain.WishlistItem;
import com.pixelmart.catalog.dto.ProductResponse;
import com.pixelmart.catalog.repository.WishlistItemRepository;
import com.pixelmart.catalog.security.GatewayPrincipal;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ProductService productService;

    public WishlistService(
            WishlistItemRepository wishlistItemRepository,
            ProductService productService
    ) {
        this.wishlistItemRepository = wishlistItemRepository;
        this.productService = productService;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listCurrentUserWishlist() {
        String userId = currentUserId();
        List<String> productIds = wishlistItemRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(WishlistItem::getProductId)
                .toList();
        return productService.listPublicByIds(productIds);
    }

    @Transactional
    public void addToWishlist(String productId) {
        String userId = currentUserId();
        productService.findProduct(productId);
        wishlistItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseGet(() -> {
                    WishlistItem item = new WishlistItem();
                    item.setUserId(userId);
                    item.setProductId(productId);
                    return wishlistItemRepository.save(item);
                });
    }

    @Transactional
    public void removeFromWishlist(String productId) {
        String userId = currentUserId();
        wishlistItemRepository.findByUserIdAndProductId(userId, productId)
                .ifPresent(wishlistItemRepository::delete);
    }

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        if (auth.getPrincipal() instanceof GatewayPrincipal principal) {
            return principal.userId();
        }
        throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
    }
}
