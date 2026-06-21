package com.pixelmart.catalog.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "search_events")
public class SearchEvent {

  @Id
  @Column(length = 36, nullable = false)
  private String id;

  @Column(nullable = false)
  private String term;

  @Column(name = "result_count", nullable = false)
  private int resultCount;

  @Column(name = "session_id", length = 64)
  private String sessionId;

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

  public void setTerm(String term) {
    this.term = term;
  }

  public void setResultCount(int resultCount) {
    this.resultCount = resultCount;
  }

  public void setSessionId(String sessionId) {
    this.sessionId = sessionId;
  }
}
