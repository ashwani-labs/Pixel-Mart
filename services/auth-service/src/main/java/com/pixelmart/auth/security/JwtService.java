package com.pixelmart.auth.security;

import com.pixelmart.auth.config.JwtProperties;
import com.pixelmart.auth.domain.Role;
import com.pixelmart.auth.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    private final JwtProperties properties;
    private final SecretKey key;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(properties.secret().getBytes(StandardCharsets.UTF_8));
            this.key = Keys.hmacShaKeyFor(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(properties.accessExpirationMs());
        List<String> roles = user.getRoles().stream().map(Role::name).toList();

        return Jwts.builder()
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("roles", roles)
                .claim("type", "access")
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(key)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long accessExpirationSeconds() {
        return properties.accessExpirationMs() / 1000;
    }
}
