CREATE TABLE store_settings (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    store_name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(512) NULL,
    logo_storage_key VARCHAR(512) NULL,
    favicon_url VARCHAR(512) NULL,
    primary_color VARCHAR(16) NOT NULL DEFAULT '#6366f1',
    support_email VARCHAR(255) NULL,
    market_currency_code VARCHAR(8) NOT NULL DEFAULT 'INR',
    market_currency_symbol VARCHAR(8) NOT NULL DEFAULT '₹',
    market_locale VARCHAR(16) NOT NULL DEFAULT 'en-IN',
    tax_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    tax_rate_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
    tax_label VARCHAR(64) NOT NULL DEFAULT 'GST',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE product_images (
    id CHAR(36) NOT NULL PRIMARY KEY,
    product_id CHAR(36) NOT NULL,
    storage_key VARCHAR(512) NOT NULL,
    alt_text VARCHAR(255) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

CREATE INDEX idx_product_images_product_id ON product_images (product_id);

CREATE TABLE audit_log (
    id CHAR(36) NOT NULL PRIMARY KEY,
    actor_user_id VARCHAR(36) NULL,
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    old_value JSON NULL,
    new_value JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_created_at ON audit_log (created_at DESC);

INSERT INTO store_settings (
    id, store_name, primary_color, market_currency_code, market_currency_symbol,
    market_locale, tax_enabled, tax_rate_percent, tax_label, support_email
) VALUES (
    'default', 'PixelMart', '#6366f1', 'INR', '₹', 'en-IN', TRUE, 18.00, 'GST', 'support@pixelmart.local'
);
