package com.pixelmart.order.controller;

import com.pixelmart.order.dto.CheckoutDtos.OrderResponse;
import com.pixelmart.order.dto.CheckoutDtos.UpdateOrderStatusRequest;
import com.pixelmart.order.service.AdminOrderService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    public AdminOrderController(AdminOrderService adminOrderService) {
        this.adminOrderService = adminOrderService;
    }

    @GetMapping
    public List<OrderResponse> list() {
        return adminOrderService.listAll();
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        return adminOrderService.updateStatus(id, request);
    }
}
