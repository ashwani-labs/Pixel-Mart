package com.pixelmart.notification.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "whatsapp_outbox")
public class WhatsAppOutbox {

  @Id
  @Column(length = 36, nullable = false)
  private String id;

  @Column(name = "recipient_phone", nullable = false, length = 20)
  private String recipientPhone;

  @Column(name = "message_body", nullable = false, columnDefinition = "TEXT")
  private String messageBody;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 16)
  private WhatsAppOutboxStatus status;

  @Column(name = "order_id", length = 36)
  private String orderId;

  @Column(name = "order_status", length = 32)
  private String orderStatus;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "sent_at")
  private Instant sentAt;

  @PrePersist
  void onCreate() {
    if (id == null) {
      id = UUID.randomUUID().toString();
    }
    if (createdAt == null) {
      createdAt = Instant.now();
    }
  }

  public String getId() {
    return id;
  }

  public String getRecipientPhone() {
    return recipientPhone;
  }

  public void setRecipientPhone(String recipientPhone) {
    this.recipientPhone = recipientPhone;
  }

  public String getMessageBody() {
    return messageBody;
  }

  public void setMessageBody(String messageBody) {
    this.messageBody = messageBody;
  }

  public WhatsAppOutboxStatus getStatus() {
    return status;
  }

  public void setStatus(WhatsAppOutboxStatus status) {
    this.status = status;
  }

  public String getOrderId() {
    return orderId;
  }

  public void setOrderId(String orderId) {
    this.orderId = orderId;
  }

  public String getOrderStatus() {
    return orderStatus;
  }

  public void setOrderStatus(String orderStatus) {
    this.orderStatus = orderStatus;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getSentAt() {
    return sentAt;
  }

  public void setSentAt(Instant sentAt) {
    this.sentAt = sentAt;
  }
}
