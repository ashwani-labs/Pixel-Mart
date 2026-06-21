package com.pixelmart.notification.repository;

import com.pixelmart.notification.domain.WhatsAppOutbox;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WhatsAppOutboxRepository extends JpaRepository<WhatsAppOutbox, String> {}
