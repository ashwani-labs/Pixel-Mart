package com.pixelmart.order.repository;

import com.pixelmart.order.domain.Payment;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, String> {

  Optional<Payment> findByOrderId(String orderId);
}
