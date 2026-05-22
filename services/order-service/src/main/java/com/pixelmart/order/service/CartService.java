package com.pixelmart.order.service;

import com.pixelmart.order.client.CatalogClient;
import com.pixelmart.order.client.CatalogProductSnapshot;
import com.pixelmart.order.domain.Cart;
import com.pixelmart.order.domain.CartItem;
import com.pixelmart.order.dto.CartDtos.AddCartItemRequest;
import com.pixelmart.order.dto.CartDtos.CartItemResponse;
import com.pixelmart.order.dto.CartDtos.CartResponse;
import com.pixelmart.order.dto.CartDtos.UpdateCartItemRequest;
import com.pixelmart.order.exception.BadRequestException;
import com.pixelmart.order.exception.ResourceNotFoundException;
import com.pixelmart.order.repository.CartItemRepository;
import com.pixelmart.order.repository.CartRepository;
import com.pixelmart.order.security.GatewayPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CatalogClient catalogClient;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            CatalogClient catalogClient
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.catalogClient = catalogClient;
    }

    @Transactional(readOnly = true)
    public CartResponse getCart() {
        return buildResponse(findOrEmptyItems());
    }

    @Transactional
    public CartResponse addItem(AddCartItemRequest request) {
        Cart cart = findOrCreateCart();
        CatalogProductSnapshot product = catalogClient.getProductForCart(request.productId());
        if (!product.visible()) {
            throw new BadRequestException("Product is not available");
        }
        int quantity = request.resolvedQuantity();
        if (product.stockQty() < quantity) {
            throw new BadRequestException("Insufficient stock");
        }

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.id())
                .orElse(null);
        if (item != null) {
            int newQty = item.getQuantity() + quantity;
            if (newQty > product.stockQty()) {
                throw new BadRequestException("Insufficient stock");
            }
            item.setQuantity(newQty);
            item.setUnitPrice(product.basePrice());
            item.setProductName(product.name());
            item.setProductSlug(product.slug());
            cartItemRepository.save(item);
        } else {
            CartItem created = new CartItem();
            created.setCartId(cart.getId());
            created.setProductId(product.id());
            created.setProductName(product.name());
            created.setProductSlug(product.slug());
            created.setUnitPrice(product.basePrice());
            created.setQuantity(quantity);
            cartItemRepository.save(created);
        }
        return buildResponse(cartItemRepository.findByCartIdOrderByCreatedAtAsc(cart.getId()));
    }

    @Transactional
    public CartResponse updateItem(String itemId, UpdateCartItemRequest request) {
        Cart cart = findOrCreateCart();
        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", itemId));

        CatalogProductSnapshot product = catalogClient.getProductForCart(item.getProductId());
        if (!product.visible()) {
            throw new BadRequestException("Product is no longer available");
        }
        if (request.quantity() > product.stockQty()) {
            throw new BadRequestException("Insufficient stock");
        }

        item.setQuantity(request.quantity());
        item.setUnitPrice(product.basePrice());
        cartItemRepository.save(item);
        return buildResponse(cartItemRepository.findByCartIdOrderByCreatedAtAsc(cart.getId()));
    }

    @Transactional
    public CartResponse removeItem(String itemId) {
        Cart cart = findOrCreateCart();
        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", itemId));
        cartItemRepository.delete(item);
        return buildResponse(cartItemRepository.findByCartIdOrderByCreatedAtAsc(cart.getId()));
    }

    private List<CartItem> findOrEmptyItems() {
        return cartRepository.findByUserId(currentUserId())
                .map(cart -> cartItemRepository.findByCartIdOrderByCreatedAtAsc(cart.getId()))
                .orElse(List.of());
    }

    private Cart findOrCreateCart() {
        String userId = currentUserId();
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUserId(userId);
                    return cartRepository.save(cart);
                });
    }

    private CartResponse buildResponse(List<CartItem> items) {
        List<CartItemResponse> responses = items.stream().map(CartItemResponse::from).toList();
        int totalQuantity = items.stream().mapToInt(CartItem::getQuantity).sum();
        BigDecimal subtotal = responses.stream()
                .map(CartItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartResponse(responses, responses.size(), totalQuantity, subtotal);
    }

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof GatewayPrincipal principal) {
            return principal.userId();
        }
        throw new BadRequestException("Authentication required");
    }
}
