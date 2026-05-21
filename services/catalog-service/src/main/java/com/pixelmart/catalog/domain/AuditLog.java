package com.pixelmart.catalog.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @Column(length = 36, nullable = false)
    private String id;

    @Column(name = "actor_user_id", length = 36)
    private String actorUserId;

    @Column(nullable = false, length = 64)
    private String action;

    @Column(name = "entity_type", nullable = false, length = 64)
    private String entityType;

    @Column(name = "entity_id", nullable = false, length = 64)
    private String entityId;

    @Column(name = "old_value", columnDefinition = "JSON")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "JSON")
    private String newValue;

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

    public static AuditLog of(String actorUserId, String action, String entityType, String entityId,
                              String oldValue, String newValue) {
        AuditLog log = new AuditLog();
        log.actorUserId = actorUserId;
        log.action = action;
        log.entityType = entityType;
        log.entityId = entityId;
        log.oldValue = oldValue;
        log.newValue = newValue;
        return log;
    }
}
