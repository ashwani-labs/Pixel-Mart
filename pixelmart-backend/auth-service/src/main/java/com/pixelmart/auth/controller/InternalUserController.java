package com.pixelmart.auth.controller;

import com.pixelmart.auth.domain.User;
import com.pixelmart.auth.dto.AdminUserResponse;
import com.pixelmart.auth.dto.InternalGuestSessionRequest;
import com.pixelmart.auth.dto.InternalGuestSessionResponse;
import com.pixelmart.auth.dto.InternalUserResponse;
import com.pixelmart.auth.dto.LoyaltyPointsRequest;
import com.pixelmart.auth.dto.PageResponse;
import com.pixelmart.auth.exception.ResourceNotFoundException;
import com.pixelmart.auth.repository.UserRepository;
import com.pixelmart.auth.service.AdminUserService;
import com.pixelmart.auth.service.GuestAuthService;
import com.pixelmart.auth.service.LoyaltyService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/internal/users")
public class InternalUserController {

  private final UserRepository userRepository;
  private final GuestAuthService guestAuthService;
  private final AdminUserService adminUserService;
  private final LoyaltyService loyaltyService;

  public InternalUserController(
      UserRepository userRepository,
      GuestAuthService guestAuthService,
      AdminUserService adminUserService,
      LoyaltyService loyaltyService) {
    this.userRepository = userRepository;
    this.guestAuthService = guestAuthService;
    this.adminUserService = adminUserService;
    this.loyaltyService = loyaltyService;
  }

  @PostMapping("/guest-session")
  public InternalGuestSessionResponse guestSession(
      @Valid @RequestBody InternalGuestSessionRequest request) {
    return guestAuthService.createGuestSession(request);
  }

  @GetMapping
  public PageResponse<AdminUserResponse> listCustomers(
      @PageableDefault(size = 100, sort = "createdAt", direction = Sort.Direction.DESC)
          Pageable pageable) {
    return adminUserService.listCustomersInternal(pageable);
  }

  @GetMapping("/{id}")
  public InternalUserResponse getById(@PathVariable String id) {
    User user =
        userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", id));
    return new InternalUserResponse(user.getId(), user.getEmail(), user.getName());
  }

  @PostMapping("/{id}/loyalty-points")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void addLoyaltyPoints(
      @PathVariable String id, @Valid @RequestBody LoyaltyPointsRequest request) {
    loyaltyService.addPoints(id, request.points());
  }
}
