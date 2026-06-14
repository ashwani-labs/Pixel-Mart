package com.pixelmart.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Component
public class InternalServiceAuthFilter extends OncePerRequestFilter {

    public static final String INTERNAL_SERVICE_HEADER = "X-Internal-Service";

    @Value("${pixelmart.internal.allowed-services:order-service}")
    private String allowedServices;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/auth/internal/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String service = request.getHeader(INTERNAL_SERVICE_HEADER);
        if (service == null || !isAllowed(service)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getOutputStream().write(
                    "{\"error\":\"Forbidden\",\"message\":\"Internal service access only\"}"
                            .getBytes(StandardCharsets.UTF_8)
            );
            return;
        }
        filterChain.doFilter(request, response);
    }

    private boolean isAllowed(String service) {
        return Arrays.stream(allowedServices.split(","))
                .map(String::trim)
                .anyMatch(service::equals);
    }
}
