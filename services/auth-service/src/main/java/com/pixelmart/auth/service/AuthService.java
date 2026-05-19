package com.pixelmart.auth.service;

import com.pixelmart.auth.domain.Role;
import com.pixelmart.auth.domain.User;
import com.pixelmart.auth.dto.AuthResponse;
import com.pixelmart.auth.dto.AuthTokens;
import com.pixelmart.auth.dto.LoginRequest;
import com.pixelmart.auth.dto.RegisterRequest;
import com.pixelmart.auth.dto.UpdateProfileRequest;
import com.pixelmart.auth.dto.UserResponse;
import com.pixelmart.auth.exception.EmailAlreadyExistsException;
import com.pixelmart.auth.exception.InvalidCredentialsException;
import com.pixelmart.auth.repository.UserRepository;
import com.pixelmart.auth.security.JwtService;
import com.pixelmart.auth.security.RefreshTokenService;
import com.pixelmart.auth.security.UserPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public AuthTokens register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }

        User user = new User();
        user.setEmail(request.email().trim().toLowerCase());
        user.setName(request.name().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRoles(Set.of(Role.CUSTOMER));
        userRepository.save(user);

        return issueTokens(user);
    }

    @Transactional
    public AuthTokens login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .filter(User::isEnabled)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        return issueTokens(user);
    }

    @Transactional
    public AuthTokens refresh(String rawRefreshToken) {
        String userId = refreshTokenService.validateAndRevoke(rawRefreshToken);
        User user = userRepository.findById(userId)
                .filter(User::isEnabled)
                .orElseThrow(InvalidCredentialsException::new);
        return issueTokens(user);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            refreshTokenService.revoke(rawRefreshToken);
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        UserPrincipal principal = currentPrincipal();
        User user = userRepository.findById(principal.id())
                .filter(User::isEnabled)
                .orElseThrow(InvalidCredentialsException::new);
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateCurrentUser(UpdateProfileRequest request) {
        UserPrincipal principal = currentPrincipal();
        User user = userRepository.findById(principal.id())
                .filter(User::isEnabled)
                .orElseThrow(InvalidCredentialsException::new);
        user.setName(request.name().trim());
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public Optional<User> findEnabledUser(String userId) {
        return userRepository.findById(userId).filter(User::isEnabled);
    }

    private AuthTokens issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user);
        AuthResponse auth = new AuthResponse(accessToken, jwtService.accessExpirationSeconds(), UserResponse.from(user));
        return new AuthTokens(auth, refreshToken);
    }

    private UserPrincipal currentPrincipal() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new InvalidCredentialsException();
        }
        return principal;
    }
}
