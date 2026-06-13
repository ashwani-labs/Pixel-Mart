CREATE TABLE orders (
    id CHAR(36) NOT NULL PRIMARY KEY,
    order_number VARCHAR(32) NOT NULL UNIQUE,
    user_id CHAR(36) NOT NULL,
    address_id CHAR(36) NOT NULL,
    status VARCHAR(32) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_total DECIMAL(12, 2) NOT NULL,
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
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES addresses (id)
);

CREATE TABLE order_items (
    id CHAR(36) NOT NULL PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
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
CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_payments_order_id ON payments (order_id);
