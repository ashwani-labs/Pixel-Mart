package com.pixelmart.notification.dto;

import com.pixelmart.notification.domain.WhatsAppOutbox;
import com.pixelmart.notification.domain.WhatsAppOutboxStatus;
import java.time.Instant;

public record WhatsAppOutboxResponse(
    String id,
    String recipientPhone,
    String messageBody,
    WhatsAppOutboxStatus status,
    String orderId,
    String orderStatus,
    Instant createdAt,
    Instant sentAt) {
  public static WhatsAppOutboxResponse from(WhatsAppOutbox outbox) {
    return new WhatsAppOutboxResponse(
        outbox.getId(),
        outbox.getRecipientPhone(),
        outbox.getMessageBody(),
        outbox.getStatus(),
        outbox.getOrderId(),
        outbox.getOrderStatus(),
        outbox.getCreatedAt(),
        outbox.getSentAt());
  }
}
