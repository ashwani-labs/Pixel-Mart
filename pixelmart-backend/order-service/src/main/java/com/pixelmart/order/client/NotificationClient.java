package com.pixelmart.order.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;

@Component
public class NotificationClient {

    private static final Logger log = LoggerFactory.getLogger(NotificationClient.class);

    private final RestTemplate restTemplate;
    private final NotificationClientProperties properties;

    public NotificationClient(RestTemplateBuilder builder, NotificationClientProperties properties) {
        this.restTemplate = builder.build();
        this.properties = properties;
    }

    public void sendOrderConfirmation(OrderConfirmationPayload payload) {
        String url = properties.getBaseUrl() + "/api/internal/email/order-confirmation";
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Service", properties.getInternalServiceName());
        try {
            restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(payload, headers),
                    Void.class
            );
        } catch (Exception ex) {
            log.warn("Failed to queue order confirmation email for {}: {}", payload.orderNumber(), ex.getMessage());
        }
    }

    public record OrderConfirmationPayload(
            String orderId,
            String orderNumber,
            String recipientEmail,
            String recipientName,
            String status,
            BigDecimal grandTotal,
            String currencyCode,
            List<OrderLinePayload> items
    ) {
    }

    public record OrderLinePayload(
            String productName,
            int quantity,
            BigDecimal lineTotal
    ) {
    }
}
