package com.pixelmart.notification.repository;

import com.pixelmart.notification.domain.EmailOutbox;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailOutboxRepository extends JpaRepository<EmailOutbox, String> {
}
