package com.pixelmart.catalog.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelmart.catalog.domain.AuditLog;
import com.pixelmart.catalog.dto.AuditLogResponse;
import com.pixelmart.catalog.dto.PageResponse;
import com.pixelmart.catalog.repository.AuditLogRepository;
import com.pixelmart.catalog.security.GatewayPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AuditLogService(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> list(String action, Instant from, Instant to, Pageable pageable) {
        String normalizedAction = action == null || action.isBlank() ? null : action.trim();
        Page<AuditLog> page = auditLogRepository.search(normalizedAction, from, to, pageable);
        return PageResponse.from(page.map(AuditLogResponse::from));
    }

    @Transactional
    public void log(String action, String entityType, String entityId, Object oldValue, Object newValue) {
        auditLogRepository.save(AuditLog.of(
                currentActorId(),
                action,
                entityType,
                entityId,
                toJson(oldValue),
                toJson(newValue)
        ));
    }

    private String currentActorId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof GatewayPrincipal principal) {
            return principal.userId();
        }
        return null;
    }

    private String toJson(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return "\"" + value + "\"";
        }
    }
}
