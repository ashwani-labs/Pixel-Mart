package com.pixelmart.notification.service;

import com.pixelmart.notification.domain.EmailOutbox;
import com.pixelmart.notification.domain.EmailOutboxStatus;
import com.pixelmart.notification.dto.AbandonedCartRequest;
import com.pixelmart.notification.dto.EmailOutboxResponse;
import com.pixelmart.notification.repository.EmailOutboxRepository;
import java.text.NumberFormat;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AbandonedCartEmailService {

  private final EmailOutboxRepository emailOutboxRepository;

  public AbandonedCartEmailService(EmailOutboxRepository emailOutboxRepository) {
    this.emailOutboxRepository = emailOutboxRepository;
  }

  @Transactional
  public EmailOutboxResponse queue(AbandonedCartRequest request) {
    String formatted =
        NumberFormat.getCurrencyInstance(Locale.forLanguageTag("en-IN")).format(request.subtotal());
    String subject = "You left items in your PixelMart cart";
    String bodyHtml =
        """
                <p>Hi %s,</p>
                <p>You still have <strong>%d items</strong> worth <strong>%s</strong> waiting in your cart.</p>
                <p>Complete checkout before they sell out.</p>
                <p><a href="http://localhost:5173/cart">Return to cart</a></p>
                """
            .formatted(request.recipientName(), request.itemCount(), formatted);

    EmailOutbox outbox = new EmailOutbox();
    outbox.setRecipientTo(request.recipientEmail());
    outbox.setSubject(subject);
    outbox.setBodyHtml(bodyHtml);
    outbox.setStatus(EmailOutboxStatus.PENDING);
    EmailOutbox saved = emailOutboxRepository.save(outbox);
    return EmailOutboxResponse.from(saved);
  }
}
