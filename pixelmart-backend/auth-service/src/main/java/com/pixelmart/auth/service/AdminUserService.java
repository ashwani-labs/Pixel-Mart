package com.pixelmart.auth.service;

import com.pixelmart.auth.domain.Role;
import com.pixelmart.auth.domain.User;
import com.pixelmart.auth.dto.AdminUserResponse;
import com.pixelmart.auth.dto.PageResponse;
import com.pixelmart.auth.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminUserService {

  private final UserRepository userRepository;

  public AdminUserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public PageResponse<AdminUserResponse> listCustomers(Pageable pageable) {
    Page<User> page = userRepository.findByRolesContaining(Role.CUSTOMER, pageable);
    return PageResponse.from(page.map(this::toResponse));
  }

  @Transactional(readOnly = true)
  public PageResponse<AdminUserResponse> listCustomersInternal(Pageable pageable) {
    return listCustomers(pageable);
  }

  private AdminUserResponse toResponse(User user) {
    return new AdminUserResponse(
        user.getId(),
        user.getEmail(),
        user.getName(),
        user.isEnabled(),
        user.getLoyaltyPoints(),
        user.getReferralCode(),
        user.getCreatedAt());
  }
}
