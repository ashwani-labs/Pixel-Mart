package com.pixelmart.catalog.security;

import java.util.Optional;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {

  private CurrentUser() {}

  public static String requireUserId() {
    return userId()
        .orElseThrow(
            () -> new org.springframework.security.access.AccessDeniedException("Unauthorized"));
  }

  public static Optional<String> userId() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
      return Optional.empty();
    }
    if (auth.getPrincipal() instanceof GatewayPrincipal principal) {
      return Optional.of(principal.userId());
    }
    return Optional.empty();
  }
}
