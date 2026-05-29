package com.pixelmart.catalog.security;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {

    private CurrentUser() {
    }

    public static String requireUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        if (auth.getPrincipal() instanceof GatewayPrincipal principal) {
            return principal.userId();
        }
        throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
    }
}
