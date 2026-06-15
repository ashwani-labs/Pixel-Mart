package com.pixelmart.order.service;

import com.pixelmart.order.client.AuthClient;
import com.pixelmart.order.client.AuthUserSnapshot;
import com.pixelmart.order.client.CatalogClient;
import com.pixelmart.order.client.CatalogStoreSettings;
import com.pixelmart.order.client.NotificationClient;
import com.pixelmart.order.client.NotificationClient.AbandonedCartPayload;
import com.pixelmart.order.domain.Cart;
import com.pixelmart.order.domain.CartItem;
import com.pixelmart.order.repository.CartItemRepository;
import com.pixelmart.order.repository.CartRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class AbandonedCartService {

    private static final Logger log = LoggerFactory.getLogger(AbandonedCartService.class);

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AuthClient authClient;
    private final CatalogClient catalogClient;
    private final NotificationClient notificationClient;

    public AbandonedCartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            AuthClient authClient,
            CatalogClient catalogClient,
            NotificationClient notificationClient
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.authClient = authClient;
        this.catalogClient = catalogClient;
        this.notificationClient = notificationClient;
    }

    @Scheduled(fixedDelayString = "${pixelmart.abandoned-cart.poll-ms:3600000}")
    @Transactional
    public void sendAbandonedCartReminders() {
        Instant cutoff = Instant.now().minus(1, ChronoUnit.HOURS);
        List<Cart> carts = cartRepository.findAbandonedCarts(cutoff);
        if (carts.isEmpty()) {
            return;
        }
        CatalogStoreSettings settings = catalogClient.getStoreSettings();
        for (Cart cart : carts) {
            try {
                List<CartItem> items = cartItemRepository.findByCartIdOrderByCreatedAtAsc(cart.getId());
                if (items.isEmpty()) {
                    continue;
                }
                AuthUserSnapshot user = authClient.getUser(cart.getUserId());
                int totalQty = items.stream().mapToInt(CartItem::getQuantity).sum();
                BigDecimal subtotal = items.stream()
                        .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                notificationClient.sendAbandonedCart(new AbandonedCartPayload(
                        user.email(),
                        user.name(),
                        totalQty,
                        subtotal,
                        settings.effectiveCurrencyCode()
                ));
                cart.setAbandonedCartEmailSentAt(Instant.now());
                cartRepository.save(cart);
            } catch (Exception ex) {
                log.warn("Abandoned cart email failed for cart {}: {}", cart.getId(), ex.getMessage());
            }
        }
    }
}
