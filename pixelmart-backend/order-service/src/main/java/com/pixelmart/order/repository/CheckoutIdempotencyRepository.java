package com.pixelmart.order.repository;

import com.pixelmart.order.domain.CheckoutIdempotency;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckoutIdempotencyRepository extends JpaRepository<CheckoutIdempotency, String> {

  Optional<CheckoutIdempotency> findByUserIdAndIdempotencyKey(String userId, String idempotencyKey);
}
