package com.pixelmart.catalog.dto;

import com.pixelmart.catalog.domain.AuditLog;

import java.time.Instant;

public record AuditLogResponse(
        String id,
        String actorUserId,
        String action,
        String entityType,
        String entityId,
        String oldValue,
        String newValue,
        Instant createdAt
) {
    public static AuditLogResponse from(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getActorUserId(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getOldValue(),
                log.getNewValue(),
                log.getCreatedAt()
        );
    }
}
