-- Notification service DDL. Runs on first MySQL init (database: notify).
USE notify;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS schema_bootstrap (
    id TINYINT NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT IGNORE INTO schema_bootstrap (id) VALUES (1);

CREATE TABLE email_outbox (
    id CHAR(36) NOT NULL PRIMARY KEY,
    recipient_to VARCHAR(255) NOT NULL,
    subject VARCHAR(512) NOT NULL,
    body_html MEDIUMTEXT NOT NULL,
    status VARCHAR(16) NOT NULL,
    order_id CHAR(36) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL
);

CREATE INDEX idx_email_outbox_order_id ON email_outbox (order_id);
CREATE INDEX idx_email_outbox_status ON email_outbox (status);
CREATE INDEX idx_email_outbox_created_at ON email_outbox (created_at DESC);

CREATE TABLE whatsapp_outbox (
    id CHAR(36) NOT NULL PRIMARY KEY,
    recipient_phone VARCHAR(20) NOT NULL,
    message_body TEXT NOT NULL,
    status VARCHAR(16) NOT NULL,
    order_id CHAR(36) NULL,
    order_status VARCHAR(32) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL
);

CREATE INDEX idx_whatsapp_outbox_order_id ON whatsapp_outbox (order_id);
CREATE INDEX idx_whatsapp_outbox_status ON whatsapp_outbox (status);
CREATE INDEX idx_whatsapp_outbox_created_at ON whatsapp_outbox (created_at DESC);
