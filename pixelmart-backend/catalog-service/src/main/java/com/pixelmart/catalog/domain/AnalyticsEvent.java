package com.pixelmart.catalog.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "analytics_events")
public class AnalyticsEvent {

  @Id
  @Column(length = 36, nullable = false)
  private String id;

  @Column(name = "event_type", nullable = false, length = 32)
  private String eventType;

  @Column(name = "product_id", length = 36)
  private String productId;

  @Column(name = "session_id", length = 64)
  private String sessionId;

  @Column(name = "user_id", length = 36)
  private String userId;

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

  public void setEventType(String eventType) {
    this.eventType = eventType;
  }

  public void setProductId(String productId) {
    this.productId = productId;
  }

  public void setSessionId(String sessionId) {
    this.sessionId = sessionId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }
}
