package com.pixelmart.order.repository;

import com.pixelmart.order.domain.CheckoutIdempotency;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CheckoutIdempotencyRepository extends JpaRepository<CheckoutIdempotency, String> {

    Optional<CheckoutIdempotency> findByUserIdAndIdempotencyKey(String userId, String idempotencyKey);
}
