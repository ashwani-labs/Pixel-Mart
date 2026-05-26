CREATE TABLE offers (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(16) NOT NULL,
    scope VARCHAR(16) NOT NULL,
    product_id CHAR(36) NULL,
    category_id CHAR(36) NULL,
    value DECIMAL(12, 2) NOT NULL,
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NULL,
    coupon_code VARCHAR(64) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_offers_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_offers_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE INDEX idx_offers_active_dates ON offers (active, starts_at, ends_at);
CREATE INDEX idx_offers_product_id ON offers (product_id);
CREATE INDEX idx_offers_category_id ON offers (category_id);
CREATE INDEX idx_offers_coupon_code ON offers (coupon_code);

INSERT INTO offers (
    id, name, type, scope, product_id, category_id, value, starts_at, ends_at, coupon_code, active
) VALUES
('offer-electronics-launch', 'Electronics launch deal', 'PERCENT', 'CATEGORY', NULL, 'cat-electronics', 10.00, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), NULL, TRUE),
('offer-expired-mugs', 'Expired mug markdown', 'FIXED', 'PRODUCT', 'prod-009', NULL, 250.00, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 DAY), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), NULL, TRUE),
('offer-fashion-coupon', 'Fashion coupon', 'PERCENT', 'CATEGORY', NULL, 'cat-fashion', 15.00, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), 'STYLE15', TRUE);
