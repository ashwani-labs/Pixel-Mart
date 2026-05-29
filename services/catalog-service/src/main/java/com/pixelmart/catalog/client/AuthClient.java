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
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Service", properties.getInternalServiceName());
        try {
            ResponseEntity<AuthUserSnapshot> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    AuthUserSnapshot.class
            );
            AuthUserSnapshot body = response.getBody();
            if (body == null) {
                throw new BadRequestException("User not available");
            }
            return body;
        } catch (HttpStatusCodeException ex) {
            throw new BadRequestException("Unable to load user profile");
        }
    }
}
