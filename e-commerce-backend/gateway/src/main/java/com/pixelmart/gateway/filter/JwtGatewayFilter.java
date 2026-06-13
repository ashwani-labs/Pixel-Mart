package com.pixelmart.gateway.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelmart.gateway.security.GatewayJwtService;
import io.jsonwebtoken.JwtException;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Component
public class JwtGatewayFilter implements GlobalFilter, Ordered {

    private static final List<String> PUBLIC_POST_PATHS = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/refresh",
            "/api/auth/logout"
    );

    private final GatewayJwtService jwtService;
    private final ObjectMapper objectMapper;

    public JwtGatewayFilter(GatewayJwtService jwtService, ObjectMapper objectMapper) {
        this.jwtService = jwtService;
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        if (isPublic(path, request.getMethod())) {
            return chain.filter(maybeEnrichWithUser(exchange, request));
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange, path);
        }

        try {
            return chain.filter(exchange.mutate().request(enrichRequest(request, authHeader)).build());
        } catch (JwtException | IllegalArgumentException ex) {
            return unauthorized(exchange, path);
        }
    }

    private ServerHttpRequest enrichRequest(ServerHttpRequest request, String authHeader) {
        var claims = jwtService.parseAccessToken(authHeader.substring(7));
        String userId = claims.getSubject();
        String roles = String.join(",", jwtService.roles(claims));

        return request.mutate()
                .header("X-User-Id", userId)
                .header("X-Roles", roles)
                .build();
    }

    private ServerWebExchange maybeEnrichWithUser(ServerWebExchange exchange, ServerHttpRequest request) {
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return exchange;
        }

        try {
            ServerHttpRequest enriched = enrichRequest(request, authHeader);
            return exchange.mutate().request(enriched).build();
        } catch (JwtException | IllegalArgumentException ex) {
            return exchange;
        }
    }

    private boolean isPublic(String path, HttpMethod method) {
        if (path.startsWith("/actuator")) {
            return true;
        }
        if (path.equals("/api/auth/health")) {
            return true;
        }
        if (method == HttpMethod.POST && PUBLIC_POST_PATHS.contains(path)) {
            return true;
        }
        if (method == HttpMethod.GET && path.startsWith("/api/catalog/")) {
            return !path.startsWith("/api/catalog/wishlist");
        }
        return false;
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String path) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        try {
            byte[] body = objectMapper.writeValueAsBytes(Map.of(
                    "status", 401,
                    "error", "Unauthorized",
                    "message", "Authentication required",
                    "path", path
            ));
            DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(body);
            return exchange.getResponse().writeWith(Mono.just(buffer));
        } catch (Exception e) {
            byte[] fallback = "{\"status\":401,\"error\":\"Unauthorized\"}".getBytes(StandardCharsets.UTF_8);
            return exchange.getResponse().writeWith(Mono.just(
                    exchange.getResponse().bufferFactory().wrap(fallback)));
        }
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }
}
