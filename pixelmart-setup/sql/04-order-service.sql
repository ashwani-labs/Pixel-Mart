-- Order service DDL. Runs on first MySQL init (database: orders).
USE orders;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS schema_bootstrap (
    id TINYINT NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT IGNORE INTO schema_bootstrap (id) VALUES (1);

CREATE TABLE carts (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    abandoned_cart_email_sent_at TIMESTAMP NULL,
    CONSTRAINT uq_carts_user_id UNIQUE (user_id)
);

CREATE TABLE cart_items (
    id CHAR(36) NOT NULL PRIMARY KEY,
    cart_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    variant_id CHAR(36) NULL,
    product_name VARCHAR(255) NOT NULL,
    product_slug VARCHAR(255) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
    CONSTRAINT chk_cart_items_quantity CHECK (quantity > 0)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items (cart_id);
CREATE UNIQUE INDEX uq_cart_items_line ON cart_items (cart_id, product_id, (IFNULL(variant_id, '')));

CREATE TABLE addresses (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    label VARCHAR(64) NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255) NULL,
    city VARCHAR(128) NOT NULL,
    state VARCHAR(128) NOT NULL,
    pincode CHAR(6) NOT NULL,
    country VARCHAR(64) NOT NULL DEFAULT 'India',
    post_office_name VARCHAR(255) NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_addresses_pincode CHECK (pincode REGEXP '^[0-9]{6}$')
);

CREATE INDEX idx_addresses_user_id ON addresses (user_id);

CREATE TABLE pincode_cache (
    pincode CHAR(6) NOT NULL PRIMARY KEY,
    payload_json JSON NOT NULL,
    cached_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id CHAR(36) NOT NULL PRIMARY KEY,
    order_number VARCHAR(32) NOT NULL UNIQUE,
    user_id CHAR(36) NOT NULL,
    address_id CHAR(36) NOT NULL,
    status VARCHAR(32) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    discount_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount_label VARCHAR(255) NULL,
    coupon_code VARCHAR(64) NULL,
    tax_total DECIMAL(12, 2) NOT NULL,
    shipping_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    grand_total DECIMAL(12, 2) NOT NULL,
    tax_label VARCHAR(64) NOT NULL,
    tax_rate_percent DECIMAL(5, 2) NOT NULL,
    payment_method VARCHAR(32) NOT NULL,
    payment_status VARCHAR(32) NOT NULL,
    ship_to_name VARCHAR(255) NOT NULL,
    ship_to_phone VARCHAR(20) NOT NULL,
    ship_address_line1 VARCHAR(255) NOT NULL,
    ship_address_line2 VARCHAR(255) NULL,
    ship_city VARCHAR(128) NOT NULL,
    ship_state VARCHAR(128) NOT NULL,
    ship_pincode CHAR(6) NOT NULL,
    ship_country VARCHAR(64) NOT NULL,
    ship_post_office_name VARCHAR(255) NULL,
    tracking_number VARCHAR(64) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES addresses (id)
);

CREATE TABLE order_items (
    id CHAR(36) NOT NULL PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    variant_id CHAR(36) NULL,
    product_name VARCHAR(255) NOT NULL,
    product_slug VARCHAR(255) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    quantity INT NOT NULL,
    line_total DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);

CREATE TABLE payments (
    id CHAR(36) NOT NULL PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    method VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    provider_reference VARCHAR(64) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);

CREATE INDEX idx_orders_user_id_created_at ON orders (user_id, created_at DESC);
CREATE INDEX idx_orders_coupon_code ON orders (coupon_code);
CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_payments_order_id ON payments (order_id);

CREATE TABLE checkout_idempotency (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    idempotency_key VARCHAR(128) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    order_id CHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_checkout_idempotency_user_key UNIQUE (user_id, idempotency_key),
    CONSTRAINT fk_checkout_idempotency_order FOREIGN KEY (order_id) REFERENCES orders (id)
);

CREATE INDEX idx_checkout_idempotency_order_id ON checkout_idempotency (order_id);
