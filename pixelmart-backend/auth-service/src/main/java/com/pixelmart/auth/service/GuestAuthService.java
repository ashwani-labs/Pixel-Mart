package com.pixelmart.auth.service;

import com.pixelmart.auth.domain.Role;
import com.pixelmart.auth.domain.User;
import com.pixelmart.auth.dto.InternalGuestSessionRequest;
import com.pixelmart.auth.dto.InternalGuestSessionResponse;
import com.pixelmart.auth.repository.UserRepository;
import com.pixelmart.auth.security.JwtService;
import com.pixelmart.auth.security.RefreshTokenService;
import java.util.Set;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GuestAuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final RefreshTokenService refreshTokenService;

  public GuestAuthService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      RefreshTokenService refreshTokenService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.refreshTokenService = refreshTokenService;
  }

  @Transactional
  public InternalGuestSessionResponse createGuestSession(InternalGuestSessionRequest request) {
    String email = request.email().trim().toLowerCase();
    User user =
        userRepository
            .findByEmailIgnoreCase(email)
            .orElseGet(
                () -> {
                  User created = new User();
                  created.setEmail(email);
                  created.setName(request.name().trim());
                  created.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
                  created.setRoles(Set.of(Role.CUSTOMER));
                  return userRepository.save(created);
                });

    String accessToken = jwtService.generateAccessToken(user);
    refreshTokenService.createRefreshToken(user);
    return new InternalGuestSessionResponse(
        user.getId(),
        user.getEmail(),
        user.getName(),
        accessToken,
        jwtService.accessExpirationSeconds());
  }
}
