package com.pixelmart.order.service;

import com.pixelmart.order.repository.OrderItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PurchaseVerificationService {

    private final OrderItemRepository orderItemRepository;

    public PurchaseVerificationService(OrderItemRepository orderItemRepository) {
        this.orderItemRepository = orderItemRepository;
    }

    @Transactional(readOnly = true)
    public boolean hasDeliveredPurchase(String userId, String productId) {
        return orderItemRepository.existsDeliveredPurchase(userId, productId);
    }
}
