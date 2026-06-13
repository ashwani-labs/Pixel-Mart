package com.pixelmart.order.dto;

import com.pixelmart.order.domain.CartItem;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public final class CartDtos {

    private CartDtos() {
    }

    public record AddCartItemRequest(
            @NotBlank String productId,
            Integer quantity
    ) {
        public int resolvedQuantity() {
            return quantity == null || quantity < 1 ? 1 : quantity;
        }
    }

    public record UpdateCartItemRequest(
            @NotNull @Min(1) Integer quantity
    ) {
    }

    public record CartItemResponse(
            String id,
            String productId,
            String productName,
            String productSlug,
            BigDecimal unitPrice,
            int quantity,
            BigDecimal lineTotal
    ) {
        public static CartItemResponse from(CartItem item) {
            BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            return new CartItemResponse(
                    item.getId(),
                    item.getProductId(),
                    item.getProductName(),
                    item.getProductSlug(),
                    item.getUnitPrice(),
                    item.getQuantity(),
                    lineTotal
            );
        }
    }

    public record CartResponse(
            List<CartItemResponse> items,
            int itemCount,
            int totalQuantity,
            BigDecimal subtotal,
            BigDecimal discountTotal,
            String discountLabel
    ) {
        public static CartResponse withoutDiscount(
                List<CartItemResponse> items,
                int itemCount,
                int totalQuantity,
                BigDecimal subtotal
        ) {
            return new CartResponse(
                    items,
                    itemCount,
                    totalQuantity,
                    subtotal,
                    BigDecimal.ZERO.setScale(2),
                    null
            );
        }
    }
}
