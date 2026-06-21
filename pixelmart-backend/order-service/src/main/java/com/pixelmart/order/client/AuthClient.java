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
public class AuthClient {

  private final RestTemplate restTemplate;
  private final AuthClientProperties properties;

  public AuthClient(RestTemplateBuilder builder, AuthClientProperties properties) {
    this.restTemplate = builder.build();
    this.properties = properties;
  }

  public AuthUserSnapshot getUser(String userId) {
    String url = properties.getBaseUrl() + "/api/auth/internal/users/" + userId;
    HttpHeaders headers = internalHeaders();
    try {
      ResponseEntity<AuthUserSnapshot> response =
          restTemplate.exchange(
              url, HttpMethod.GET, new HttpEntity<>(headers), AuthUserSnapshot.class);
      AuthUserSnapshot body = response.getBody();
      if (body == null) {
        throw new BadRequestException("User not available");
      }
      return body;
    } catch (HttpStatusCodeException ex) {
      throw new BadRequestException("Unable to load user profile");
    }
  }

  public GuestSessionResponse createGuestSession(String email, String name) {
    String url = properties.getBaseUrl() + "/api/auth/internal/users/guest-session";
    HttpHeaders headers = internalHeaders();
    try {
      ResponseEntity<GuestSessionResponse> response =
          restTemplate.exchange(
              url,
              HttpMethod.POST,
              new HttpEntity<>(new GuestSessionRequest(email, name), headers),
              GuestSessionResponse.class);
      GuestSessionResponse body = response.getBody();
      if (body == null) {
        throw new BadRequestException("Guest session not available");
      }
      return body;
    } catch (HttpStatusCodeException ex) {
      throw new BadRequestException("Unable to create guest session");
    }
  }

  public void addLoyaltyPoints(String userId, int points) {
    if (points <= 0) {
      return;
    }
    String url = properties.getBaseUrl() + "/api/auth/internal/users/" + userId + "/loyalty-points";
    HttpHeaders headers = internalHeaders();
    try {
      restTemplate.exchange(
          url, HttpMethod.POST, new HttpEntity<>(new LoyaltyPointsPayload(points), headers), Void.class);
    } catch (HttpStatusCodeException ex) {
      throw new BadRequestException("Unable to award loyalty points");
    }
  }

  private HttpHeaders internalHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.set("X-Internal-Service", properties.getInternalServiceName());
    return headers;
  }

  public record LoyaltyPointsPayload(int points) {}
}
