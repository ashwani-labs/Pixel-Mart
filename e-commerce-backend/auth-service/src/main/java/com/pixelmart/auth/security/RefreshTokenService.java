package com.pixelmart.auth.security;

import com.pixelmart.auth.config.JwtProperties;
import com.pixelmart.auth.domain.RefreshToken;
import com.pixelmart.auth.domain.User;
import com.pixelmart.auth.exception.InvalidCredentialsException;
import com.pixelmart.auth.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, JwtProperties jwtProperties) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtProperties = jwtProperties;
    }

    @Transactional
    public String createRefreshToken(User user) {
        String rawToken = UUID.randomUUID().toString() + "." + UUID.randomUUID();
        RefreshToken entity = new RefreshToken();
        entity.setId(UUID.randomUUID().toString());
        entity.setUserId(user.getId());
        entity.setTokenHash(hash(rawToken));
        entity.setExpiresAt(Instant.now().plusMillis(jwtProperties.refreshExpirationMs()));
        refreshTokenRepository.save(entity);
        return rawToken;
    }

    @Transactional
    public String validateAndRevoke(String rawToken) {
        RefreshToken stored = refreshTokenRepository
                .findByTokenHashAndRevokedFalse(hash(rawToken))
                .filter(t -> t.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(InvalidCredentialsException::new);

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);
        return stored.getUserId();
    }

    @Transactional
    public void revoke(String rawToken) {
        refreshTokenRepository
                .findByTokenHashAndRevokedFalse(hash(rawToken))
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    public long refreshExpirationSeconds() {
        return jwtProperties.refreshExpirationMs() / 1000;
    }

    private String hash(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
