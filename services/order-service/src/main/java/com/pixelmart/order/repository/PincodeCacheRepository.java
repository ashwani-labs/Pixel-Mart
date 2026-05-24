package com.pixelmart.order.repository;

import com.pixelmart.order.domain.PincodeCache;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PincodeCacheRepository extends JpaRepository<PincodeCache, String> {
}
