package com.pixelmart.notification.service;

import com.pixelmart.notification.domain.EmailOutbox;
import com.pixelmart.notification.domain.EmailOutboxStatus;
import com.pixelmart.notification.dto.EmailOutboxResponse;
import com.pixelmart.notification.dto.OrderConfirmationRequest;
import com.pixelmart.notification.repository.EmailOutboxRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Optional;

@Service
public class OrderConfirmationEmailService {

    private static final Logger log = LoggerFactory.getLogger(OrderConfirmationEmailService.class);

    private final EmailOutboxRepository emailOutboxRepository;
    private final Optional<JavaMailSender> mailSender;
    private final String mailFrom;

    public OrderConfirmationEmailService(
            EmailOutboxRepository emailOutboxRepository,
            Optional<JavaMailSender> mailSender,
            @Value("${pixelmart.mail.from:no-reply@pixelmart.local}") String mailFrom
    ) {
        this.emailOutboxRepository = emailOutboxRepository;
        this.mailSender = mailSender;
        this.mailFrom = mailFrom;
    }

    @Transactional
    public EmailOutboxResponse sendOrderConfirmation(OrderConfirmationRequest request) {
        String subject = OrderConfirmationTemplate.subject(request.orderNumber());
        String bodyHtml = OrderConfirmationTemplate.html(request);

        EmailOutbox outbox = new EmailOutbox();
        outbox.setRecipientTo(request.recipientEmail());
        outbox.setSubject(subject);
        outbox.setBodyHtml(bodyHtml);
        outbox.setOrderId(request.orderId());
        outbox.setStatus(EmailOutboxStatus.PENDING);
        EmailOutbox saved = emailOutboxRepository.save(outbox);

        if (isSmtpConfigured()) {
            try {
                sendViaSmtp(saved);
                saved.setStatus(EmailOutboxStatus.SENT);
                saved.setSentAt(Instant.now());
            } catch (MailException ex) {
                log.warn("SMTP send failed for order {}: {}", request.orderNumber(), ex.getMessage());
                saved.setStatus(EmailOutboxStatus.FAILED);
            }
            saved = emailOutboxRepository.save(saved);
        } else {
            log.info(
                    "Order confirmation email queued (SMTP not configured). to={} order={} subject={}",
                    saved.getRecipientTo(),
                    request.orderNumber(),
                    subject
            );
        }

        return EmailOutboxResponse.from(saved);
    }

    private boolean isSmtpConfigured() {
        return mailSender.isPresent();
    }

    private void sendViaSmtp(EmailOutbox outbox) {
        JavaMailSender sender = mailSender.orElseThrow();
        try {
            var message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(outbox.getRecipientTo());
            helper.setSubject(outbox.getSubject());
            helper.setText(outbox.getBodyHtml(), true);
            sender.send(message);
        } catch (Exception ex) {
            if (ex instanceof MailException mailException) {
                throw mailException;
            }
            throw new org.springframework.mail.MailSendException("Failed to send email", ex);
        }
    }
}
