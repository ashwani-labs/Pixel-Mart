package com.pixelmart.catalog.repository;

import com.pixelmart.catalog.domain.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface AuditLogRepository extends JpaRepository<AuditLog, String> {

    @Query("""
            SELECT a FROM AuditLog a
            WHERE (:action IS NULL OR a.action = :action)
              AND (:from IS NULL OR a.createdAt >= :from)
              AND (:to IS NULL OR a.createdAt <= :to)
            """)
    Page<AuditLog> search(
            @Param("action") String action,
            @Param("from") Instant from,
            @Param("to") Instant to,
            Pageable pageable
    );
}
