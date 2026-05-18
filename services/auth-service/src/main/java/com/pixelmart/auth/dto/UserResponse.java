package com.pixelmart.auth.dto;

import com.pixelmart.auth.domain.Role;
import com.pixelmart.auth.domain.User;

import java.util.List;

public record UserResponse(
        String id,
        String email,
        String name,
        List<String> roles
) {
    public static UserResponse from(User user) {
        List<String> roles = user.getRoles().stream().map(Role::name).sorted().toList();
        return new UserResponse(user.getId(), user.getEmail(), user.getName(), roles);
    }
}
