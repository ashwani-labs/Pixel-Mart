package com.pixelmart.notification.service;

import com.pixelmart.notification.domain.WhatsAppOutbox;
import com.pixelmart.notification.domain.WhatsAppOutboxStatus;
import com.pixelmart.notification.dto.WhatsAppOrderStatusRequest;
import com.pixelmart.notification.dto.WhatsAppOutboxResponse;
import com.pixelmart.notification.repository.WhatsAppOutboxRepository;
import java.math.BigDecimal;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderStatusWhatsAppService {

  private static final Logger log = LoggerFactory.getLogger(OrderStatusWhatsAppService.class);

  private final WhatsAppOutboxRepository whatsAppOutboxRepository;
  private final boolean whatsAppEnabled;

  public OrderStatusWhatsAppService(
      WhatsAppOutboxRepository whatsAppOutboxRepository,
      @Value("${pixelmart.whatsapp.enabled:false}") boolean whatsAppEnabled) {
    this.whatsAppOutboxRepository = whatsAppOutboxRepository;
    this.whatsAppEnabled = whatsAppEnabled;
  }

  @Transactional
  public WhatsAppOutboxResponse queueOrderStatus(WhatsAppOrderStatusRequest request) {
    String message = buildMessage(request);
    WhatsAppOutbox outbox = new WhatsAppOutbox();
    outbox.setRecipientPhone(request.recipientPhone());
    outbox.setMessageBody(message);
    outbox.setOrderId(request.orderId());
    outbox.setOrderStatus(request.status());
    outbox.setStatus(WhatsAppOutboxStatus.PENDING);
    WhatsAppOutbox saved = whatsAppOutboxRepository.save(outbox);

    if (whatsAppEnabled) {
      log.info(
          "WhatsApp stub send to {} for order {}: {}",
          saved.getRecipientPhone(),
          request.orderNumber(),
          message);
      saved.setStatus(WhatsAppOutboxStatus.SENT);
      saved.setSentAt(Instant.now());
    } else {
      log.info(
          "WhatsApp queued (disabled). to={} order={} status={}",
          saved.getRecipientPhone(),
          request.orderNumber(),
          request.status());
      saved.setStatus(WhatsAppOutboxStatus.SENT);
      saved.setSentAt(Instant.now());
    }
    saved = whatsAppOutboxRepository.save(saved);
    return WhatsAppOutboxResponse.from(saved);
  }

  private String buildMessage(WhatsAppOrderStatusRequest request) {
    String currency = request.currencyCode() != null ? request.currencyCode() : "INR";
    return "Hi "
        + request.recipientName()
        + ", your PixelMart order "
        + request.orderNumber()
        + " is now "
        + request.status()
        + ". Total: "
        + formatAmount(request.grandTotal(), currency)
        + ".";
  }

  private String formatAmount(BigDecimal amount, String currency) {
    if ("INR".equalsIgnoreCase(currency)) {
      return "₹" + amount.stripTrailingZeros().toPlainString();
    }
    return currency + " " + amount.stripTrailingZeros().toPlainString();
  }
}
