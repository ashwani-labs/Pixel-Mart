package com.pixelmart.order.dto;

import com.pixelmart.order.domain.Order;
import com.pixelmart.order.domain.OrderItem;
import com.pixelmart.order.domain.Payment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public final class CheckoutDtos {

    private CheckoutDtos() {
    }

    public enum PaymentMethod {
        MOCK_CARD,
        MOCK_UPI,
        MOCK_WALLET,
        MOCK_COD
    }

    public record CheckoutRequest(
            @NotBlank String addressId,
            @NotNull PaymentMethod paymentMethod
    ) {
    }

    public record OrderItemResponse(
            String productId,
            String productName,
            String productSlug,
            BigDecimal unitPrice,
            int quantity,
            BigDecimal lineTotal
    ) {
        public static OrderItemResponse from(OrderItem item) {
            return new OrderItemResponse(
                    item.getProductId(),
                    item.getProductName(),
                    item.getProductSlug(),
                    item.getUnitPrice(),
                    item.getQuantity(),
                    item.getLineTotal()
            );
        }
    }

    public record PaymentResponse(
            String method,
            String status,
            BigDecimal amount,
            String providerReference
    ) {
        public static PaymentResponse from(Payment payment) {
            return new PaymentResponse(
                    payment.getMethod(),
                    payment.getStatus(),
                    payment.getAmount(),
                    payment.getProviderReference()
            );
        }
    }

    public record OrderResponse(
            String id,
            String orderNumber,
            String status,
            BigDecimal subtotal,
            BigDecimal taxTotal,
            BigDecimal grandTotal,
            String taxLabel,
            BigDecimal taxRatePercent,
            String shipToName,
            String shipToPhone,
            String shipAddressLine1,
            String shipAddressLine2,
            String shipCity,
            String shipState,
            String shipPincode,
            String shipCountry,
            String shipPostOfficeName,
            List<OrderItemResponse> items,
            PaymentResponse payment
    ) {
        public static OrderResponse from(Order order, List<OrderItem> items, Payment payment) {
            return new OrderResponse(
                    order.getId(),
                    order.getOrderNumber(),
                    order.getStatus(),
                    order.getSubtotal(),
                    order.getTaxTotal(),
                    order.getGrandTotal(),
                    order.getTaxLabel(),
                    order.getTaxRatePercent(),
                    order.getShipToName(),
                    order.getShipToPhone(),
                    order.getShipAddressLine1(),
                    order.getShipAddressLine2(),
                    order.getShipCity(),
                    order.getShipState(),
                    order.getShipPincode(),
                    order.getShipCountry(),
                    order.getShipPostOfficeName(),
                    items.stream().map(OrderItemResponse::from).toList(),
                    PaymentResponse.from(payment)
            );
        }
    }
}
