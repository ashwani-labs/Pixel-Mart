package com.pixelmart.order.client;

import com.pixelmart.order.exception.BadRequestException;
import java.math.BigDecimal;
import java.util.List;
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
public class CatalogClient {

  private final RestTemplate restTemplate;
  private final CatalogClientProperties properties;

  public CatalogClient(RestTemplateBuilder builder, CatalogClientProperties properties) {
    this.restTemplate = builder.build();
    this.properties = properties;
  }

  public CatalogProductSnapshot getProductForCart(String productId) {
    return getProductForCart(productId, null, null);
  }

  public CatalogProductSnapshot getProductForCart(String productId, String variantId) {
    return getProductForCart(productId, variantId, null);
  }

  public CatalogProductSnapshot getProductForCart(
      String productId, String variantId, String couponCode) {
    String url =
        UriComponentsBuilder.fromUriString(
                properties.getBaseUrl() + "/api/catalog/internal/products/" + productId)
            .queryParamIfPresent("variantId", java.util.Optional.ofNullable(blankToNull(variantId)))
            .queryParamIfPresent("couponCode", java.util.Optional.ofNullable(couponCode))
            .toUriString();
    HttpHeaders headers = new HttpHeaders();
    headers.set("X-Internal-Service", properties.getInternalServiceName());
    try {
      ResponseEntity<CatalogProductSnapshot> response =
          restTemplate.exchange(
              url, HttpMethod.GET, new HttpEntity<>(headers), CatalogProductSnapshot.class);
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

  public CatalogStoreSettings getStoreSettings() {
    String url = properties.getBaseUrl() + "/api/catalog/settings/public";
    try {
      ResponseEntity<CatalogStoreSettings> response =
          restTemplate.exchange(url, HttpMethod.GET, null, CatalogStoreSettings.class);
      CatalogStoreSettings body = response.getBody();
      if (body == null) {
        throw new BadRequestException("Unable to load store settings");
      }
      return body;
    } catch (HttpStatusCodeException ex) {
      throw new BadRequestException("Unable to load store settings");
    }
  }

  public CatalogCartDiscountSnapshot getCartDiscount(BigDecimal subtotal, String couponCode) {
    String url = properties.getBaseUrl() + "/api/catalog/internal/offers/cart-discount";
    HttpHeaders headers = new HttpHeaders();
    headers.set("X-Internal-Service", properties.getInternalServiceName());
    try {
      ResponseEntity<CatalogCartDiscountSnapshot> response =
          restTemplate.exchange(
              url,
              HttpMethod.POST,
              new HttpEntity<>(new CartDiscountRequest(subtotal, couponCode), headers),
              CatalogCartDiscountSnapshot.class);
      CatalogCartDiscountSnapshot body = response.getBody();
      if (body == null) {
        throw new BadRequestException("Unable to calculate cart discount");
      }
      return body;
    } catch (HttpStatusCodeException ex) {
      throw new BadRequestException("Unable to calculate cart discount");
    }
  }

  public void reserveStock(List<ReserveStockLine> items) {
    String url = properties.getBaseUrl() + "/api/catalog/internal/products/reserve-stock";
    HttpHeaders headers = new HttpHeaders();
    headers.set("X-Internal-Service", properties.getInternalServiceName());
    try {
      restTemplate.exchange(
          url,
          HttpMethod.POST,
          new HttpEntity<>(new ReserveStockRequest(items), headers),
          Void.class);
    } catch (HttpStatusCodeException ex) {
      throw new BadRequestException("Unable to reserve product stock");
    }
  }

  private String blankToNull(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return value.trim();
  }

  public record CartDiscountRequest(BigDecimal subtotal, String couponCode) {}

  public record ReserveStockRequest(List<ReserveStockLine> items) {}

  public record ReserveStockLine(String productId, String variantId, int quantity) {}
}
