package com.pixelmart.order.controller;

import com.pixelmart.order.dto.AdminCustomerResponse;
import com.pixelmart.order.dto.PageResponse;
import com.pixelmart.order.service.AdminCustomerService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/customers")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCustomerController {

  private final AdminCustomerService adminCustomerService;

  public AdminCustomerController(AdminCustomerService adminCustomerService) {
    this.adminCustomerService = adminCustomerService;
  }

  @GetMapping
  public PageResponse<AdminCustomerResponse> listCustomers(
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
          Pageable pageable) {
    return adminCustomerService.listCustomers(pageable);
  }
}
