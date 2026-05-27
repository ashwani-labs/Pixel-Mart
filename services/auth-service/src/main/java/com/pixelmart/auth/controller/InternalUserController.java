package com.pixelmart.auth.controller;

import com.pixelmart.auth.domain.User;
import com.pixelmart.auth.dto.InternalUserResponse;
import com.pixelmart.auth.exception.ResourceNotFoundException;
import com.pixelmart.auth.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/internal/users")
public class InternalUserController {

    private final UserRepository userRepository;

    public InternalUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/{id}")
    public InternalUserResponse getById(@PathVariable String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return new InternalUserResponse(user.getId(), user.getEmail(), user.getName());
    }
}
