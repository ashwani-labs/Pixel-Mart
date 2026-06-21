package com.pixelmart.auth.repository;

import com.pixelmart.auth.domain.ReferralRedemption;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReferralRedemptionRepository extends JpaRepository<ReferralRedemption, String> {

  boolean existsByRefereeUserId(String refereeUserId);
}
