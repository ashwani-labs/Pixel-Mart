package com.pixelmart.catalog.client;

import com.pixelmart.catalog.exception.BadRequestException;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class OrderClient {

    private final RestTemplate restTemplate;
    private final OrderClientProperties properties;

    public OrderClient(RestTemplateBuilder builder, OrderClientProperties properties) {
        this.restTemplate = builder.build();
        this.properties = properties;
    }

    public boolean hasDeliveredPurchase(String userId, String productId) {
        String url = UriComponentsBuilder
                .fromUriString(properties.getBaseUrl() + "/api/orders/internal/purchase-verification")
                .queryParam("userId", userId)
                .queryParam("productId", productId)
                .toUriString();
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Service", properties.getInternalServiceName());
        try {
            ResponseEntity<PurchaseVerificationResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    PurchaseVerificationResponse.class
            );
            PurchaseVerificationResponse body = response.getBody();
            return body != null && body.verified();
        } catch (HttpStatusCodeException ex) {
            throw new BadRequestException("Unable to verify purchase history");
        }
    }

    public record PurchaseVerificationResponse(boolean verified) {
    }
}
