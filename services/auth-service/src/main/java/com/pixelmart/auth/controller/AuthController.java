package com.pixelmart.auth.controller;

import com.pixelmart.auth.dto.AuthResponse;
import com.pixelmart.auth.dto.LoginRequest;
import com.pixelmart.auth.dto.RegisterRequest;
import com.pixelmart.auth.dto.UpdateProfileRequest;
import com.pixelmart.auth.dto.UserResponse;
import com.pixelmart.auth.security.RefreshCookieService;
import com.pixelmart.auth.security.RefreshTokenService;
import com.pixelmart.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RefreshCookieService refreshCookieService;
    private final RefreshTokenService refreshTokenService;

    public AuthController(
            AuthService authService,
            RefreshCookieService refreshCookieService,
            RefreshTokenService refreshTokenService
    ) {
        this.authService = authService;
        this.refreshCookieService = refreshCookieService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response
    ) {
        return writeTokens(authService.register(request), response);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        return writeTokens(authService.login(request), response);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String raw = refreshCookieService.readRefreshToken(request)
                .orElseThrow(com.pixelmart.auth.exception.InvalidCredentialsException::new);
        return writeTokens(authService.refresh(raw), response);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        refreshCookieService.readRefreshToken(request).ifPresent(authService::logout);
        refreshCookieService.clearRefreshCookie(response);
    }

    @GetMapping("/me")
    public UserResponse me() {
        return authService.getCurrentUser();
    }

    @PatchMapping("/me")
    public UserResponse updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        return authService.updateCurrentUser(request);
    }

    private AuthResponse writeTokens(com.pixelmart.auth.dto.AuthTokens tokens, HttpServletResponse response) {
        refreshCookieService.writeRefreshCookie(
                response,
                tokens.refreshToken(),
                refreshTokenService.refreshExpirationSeconds()
        );
        return tokens.auth();
    }
}
