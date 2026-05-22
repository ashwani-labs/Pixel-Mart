package com.pixelmart.order.client;

import com.pixelmart.order.exception.BadRequestException;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

@Component
public class CatalogClient {

    private final RestTemplate restTemplate;
    private final CatalogClientProperties properties;

    public CatalogClient(RestTemplateBuilder builder, CatalogClientProperties properties) {
        this.restTemplate = builder.build();
        this.properties = properties;
    }

    public CatalogProductSnapshot getProductForCart(String productId) {
        String url = properties.getBaseUrl() + "/api/catalog/internal/products/" + productId;
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Service", properties.getInternalServiceName());
        try {
            ResponseEntity<CatalogProductSnapshot> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    CatalogProductSnapshot.class
            );
            CatalogProductSnapshot body = response.getBody();
            if (body == null) {
                throw new BadRequestException("Product not available");
            }
            return body;
        } catch (HttpStatusCodeException ex) {
            if (ex.getStatusCode().value() == 404) {
                throw new BadRequestException("Product not found");
            }
            throw new BadRequestException("Unable to load product from catalog");
        }
    }
}
