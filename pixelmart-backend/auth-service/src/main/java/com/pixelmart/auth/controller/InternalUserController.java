package com.pixelmart.auth.controller;

import com.pixelmart.auth.domain.User;
import com.pixelmart.auth.dto.InternalGuestSessionRequest;
import com.pixelmart.auth.dto.InternalGuestSessionResponse;
import com.pixelmart.auth.dto.InternalUserResponse;
import com.pixelmart.auth.exception.ResourceNotFoundException;
import com.pixelmart.auth.repository.UserRepository;
import com.pixelmart.auth.service.GuestAuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/internal/users")
public class InternalUserController {

    private final UserRepository userRepository;
    private final GuestAuthService guestAuthService;

    public InternalUserController(UserRepository userRepository, GuestAuthService guestAuthService) {
        this.userRepository = userRepository;
        this.guestAuthService = guestAuthService;
    }

    @PostMapping("/guest-session")
    public InternalGuestSessionResponse guestSession(@Valid @RequestBody InternalGuestSessionRequest request) {
        return guestAuthService.createGuestSession(request);
    }

    @GetMapping("/{id}")
    public InternalUserResponse getById(@PathVariable String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return new InternalUserResponse(user.getId(), user.getEmail(), user.getName());
    }
}
