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
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class AuthAdminClient {

  private final RestTemplate restTemplate;
  private final AuthClientProperties properties;

  public AuthAdminClient(RestTemplateBuilder builder, AuthClientProperties properties) {
    this.restTemplate = builder.build();
    this.properties = properties;
  }

  public AuthCustomerPageResponse listCustomers(int page, int size) {
    String url =
        UriComponentsBuilder.fromUriString(properties.getBaseUrl() + "/api/auth/internal/users")
            .queryParam("page", page)
            .queryParam("size", size)
            .queryParam("sort", "createdAt,desc")
            .toUriString();
    HttpHeaders headers = internalHeaders();
    try {
      ResponseEntity<AuthCustomerPageResponse> response =
          restTemplate.exchange(
              url, HttpMethod.GET, new HttpEntity<>(headers), AuthCustomerPageResponse.class);
      AuthCustomerPageResponse body = response.getBody();
      if (body == null) {
        throw new BadRequestException("Unable to load customers");
      }
      return body;
    } catch (HttpStatusCodeException ex) {
      throw new BadRequestException("Unable to load customers");
    }
  }

  private HttpHeaders internalHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.set("X-Internal-Service", properties.getInternalServiceName());
    return headers;
  }
}
