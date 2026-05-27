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
