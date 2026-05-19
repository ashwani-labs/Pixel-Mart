package com.pixelmart.auth.security;

import com.pixelmart.auth.config.AuthCookieProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;

@Service
public class RefreshCookieService {

    private final AuthCookieProperties properties;

    public RefreshCookieService(AuthCookieProperties properties) {
        this.properties = properties;
    }

    public void writeRefreshCookie(HttpServletResponse response, String rawToken, long maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from(properties.refreshName(), rawToken)
                .httpOnly(true)
                .secure(properties.secure())
                .sameSite(properties.sameSite())
                .path(properties.path())
                .maxAge(maxAgeSeconds)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void clearRefreshCookie(HttpServletResponse response) {
        writeRefreshCookie(response, "", 0);
    }

    public Optional<String> readRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return Optional.empty();
        }
        return Arrays.stream(cookies)
                .filter(c -> properties.refreshName().equals(c.getName()))
                .map(Cookie::getValue)
                .filter(v -> v != null && !v.isBlank())
                .findFirst();
    }
}
