package com.pixelmart.notification.dto;

import com.pixelmart.notification.domain.EmailOutbox;
import com.pixelmart.notification.domain.EmailOutboxStatus;

import java.time.Instant;

public record EmailOutboxResponse(
        String id,
        String recipientTo,
        String subject,
        EmailOutboxStatus status,
        String orderId,
        Instant createdAt,
        Instant sentAt
) {
    public static EmailOutboxResponse from(EmailOutbox outbox) {
        return new EmailOutboxResponse(
                outbox.getId(),
                outbox.getRecipientTo(),
                outbox.getSubject(),
                outbox.getStatus(),
                outbox.getOrderId(),
                outbox.getCreatedAt(),
                outbox.getSentAt()
        );
    }
}
