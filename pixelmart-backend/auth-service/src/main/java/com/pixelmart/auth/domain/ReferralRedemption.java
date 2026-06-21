package com.pixelmart.auth.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "referral_redemptions")
public class ReferralRedemption {

  @Id
  @Column(length = 36, nullable = false)
  private String id;

  @Column(name = "referrer_user_id", length = 36, nullable = false)
  private String referrerUserId;

  @Column(name = "referee_user_id", length = 36, nullable = false, unique = true)
  private String refereeUserId;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @PrePersist
  void onCreate() {
    if (id == null) {
      id = UUID.randomUUID().toString();
    }
    if (createdAt == null) {
      createdAt = Instant.now();
    }
  }

  public void setReferrerUserId(String referrerUserId) {
    this.referrerUserId = referrerUserId;
  }

  public void setRefereeUserId(String refereeUserId) {
    this.refereeUserId = refereeUserId;
  }
}
