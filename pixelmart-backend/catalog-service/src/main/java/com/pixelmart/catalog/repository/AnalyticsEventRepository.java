package com.pixelmart.catalog.repository;

import com.pixelmart.catalog.domain.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;

public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, String> {

  @Query(
      "SELECT COUNT(e) FROM AnalyticsEvent e WHERE e.eventType = :eventType AND e.createdAt >= :since")
  long countByEventTypeSince(@Param("eventType") String eventType, @Param("since") Instant since);
}
