package com.pixelmart.order.security;

import com.pixelmart.order.exception.BadRequestException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {

    private CurrentUser() {
    }

    public static String requireUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof GatewayPrincipal principal) {
            return principal.userId();
        }
        throw new BadRequestException("Authentication required");
    }
}
