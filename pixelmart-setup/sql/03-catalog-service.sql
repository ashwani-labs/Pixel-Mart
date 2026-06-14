-- Catalog service DDL + seed data. Runs on first MySQL init (database: catalog).
USE catalog;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS schema_bootstrap (
    id TINYINT NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT IGNORE INTO schema_bootstrap (id) VALUES (1);

CREATE TABLE categories (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    parent_id CHAR(36) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_categories_slug UNIQUE (slug),
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE SET NULL
);

CREATE TABLE products (
    id CHAR(36) NOT NULL PRIMARY KEY,
    category_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT NULL,
    base_price DECIMAL(12, 2) NOT NULL,
    compare_at_price DECIMAL(12, 2) NULL,
    stock_qty INT NOT NULL DEFAULT 0,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_products_slug UNIQUE (slug),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_visible ON products (visible);
CREATE INDEX idx_products_featured ON products (featured);
CREATE INDEX idx_categories_active ON categories (active);

INSERT INTO categories (id, name, slug, parent_id, sort_order, active) VALUES
('cat-electronics', 'Electronics', 'electronics', NULL, 1, TRUE),
('cat-fashion', 'Fashion', 'fashion', NULL, 2, TRUE),
('cat-home', 'Home & Living', 'home-living', NULL, 3, TRUE);

INSERT INTO products (id, category_id, name, slug, description, base_price, compare_at_price, stock_qty, visible, featured) VALUES
('prod-001', 'cat-electronics', 'PixelBuds Pro', 'pixelbuds-pro', 'Wireless earbuds with active noise cancellation.', 4999.00, 5999.00, 120, TRUE, TRUE),
('prod-002', 'cat-electronics', 'Smart Watch X1', 'smart-watch-x1', 'Fitness tracking and notifications on your wrist.', 8999.00, NULL, 80, TRUE, TRUE),
('prod-003', 'cat-electronics', 'USB-C Hub 7-in-1', 'usb-c-hub-7in1', 'Expand your laptop ports with HDMI, USB, and SD.', 2499.00, 2999.00, 200, TRUE, FALSE),
('prod-004', 'cat-electronics', 'Mechanical Keyboard', 'mechanical-keyboard', 'RGB backlit keyboard with tactile switches.', 6499.00, NULL, 45, TRUE, TRUE),
('prod-005', 'cat-fashion', 'Classic Denim Jacket', 'classic-denim-jacket', 'Timeless denim jacket for all seasons.', 3999.00, 4999.00, 60, TRUE, TRUE),
('prod-006', 'cat-fashion', 'Running Sneakers', 'running-sneakers', 'Lightweight sneakers built for daily runs.', 5499.00, NULL, 90, TRUE, FALSE),
('prod-007', 'cat-fashion', 'Cotton Crew Tee 3-Pack', 'cotton-crew-tee-3pack', 'Soft cotton tees in black, white, and grey.', 1299.00, 1599.00, 150, TRUE, FALSE),
('prod-008', 'cat-fashion', 'Leather Belt', 'leather-belt', 'Genuine leather belt with brushed buckle.', 999.00, NULL, 110, TRUE, FALSE),
('prod-009', 'cat-home', 'Ceramic Mug Set', 'ceramic-mug-set', 'Set of 4 handcrafted ceramic mugs.', 1499.00, NULL, 75, TRUE, TRUE),
('prod-010', 'cat-home', 'Desk Lamp LED', 'desk-lamp-led', 'Adjustable LED desk lamp with warm/cool modes.', 2199.00, 2799.00, 55, TRUE, FALSE),
('prod-011', 'cat-home', 'Throw Pillow Pair', 'throw-pillow-pair', 'Decorative pillows for sofa or bed.', 1799.00, NULL, 100, TRUE, FALSE),
('prod-012', 'cat-home', 'Hidden Draft Product', 'hidden-draft-product', 'Not visible on storefront.', 999.00, NULL, 10, FALSE, FALSE);

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

CREATE TABLE wishlist_items (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT uk_wishlist_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX idx_wishlist_user_created ON wishlist_items(user_id, created_at DESC);

CREATE TABLE reviews (
    id VARCHAR(36) PRIMARY KEY,
    product_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    reviewer_name VARCHAR(255) NOT NULL,
    rating INT NOT NULL,
    title VARCHAR(255) NULL,
    body TEXT NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT uk_reviews_user_product UNIQUE (user_id, product_id),
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT chk_reviews_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE INDEX idx_reviews_product_status_created ON reviews(product_id, status, created_at DESC);
CREATE INDEX idx_reviews_status_created ON reviews(status, created_at DESC);

INSERT INTO products (id, category_id, name, slug, description, base_price, compare_at_price, stock_qty, visible, featured) VALUES
('prod-013', 'cat-electronics', 'Wireless Mouse Mini', 'wireless-mouse-mini', 'Compact wireless mouse with silent clicks.', 1899.00, 2299.00, 140, TRUE, FALSE),
('prod-014', 'cat-fashion', 'Canvas Tote Bag', 'canvas-tote-bag', 'Durable everyday tote with inner pocket.', 899.00, NULL, 95, TRUE, FALSE),
('prod-015', 'cat-home', 'Scented Candle Set', 'scented-candle-set', 'Set of 3 soy candles: cedar, vanilla, citrus.', 1299.00, 1599.00, 65, TRUE, TRUE);

UPDATE offers SET active = FALSE WHERE id = 'offer-expired-mugs';

INSERT INTO reviews (id, product_id, user_id, reviewer_name, rating, title, body, status, verified_purchase) VALUES
('rev-001', 'prod-001', 'demo-customer-1', 'Asha K.', 5, 'Excellent ANC', 'Blocks commute noise well and battery lasts all week.', 'APPROVED', TRUE),
('rev-002', 'prod-001', 'demo-customer-2', 'Rahul M.', 4, 'Solid daily driver', 'Comfortable fit. Wish the case was slightly smaller.', 'APPROVED', TRUE),
('rev-003', 'prod-004', 'demo-customer-3', 'Neha S.', 5, 'Typing feel is great', 'Tactile switches and bright RGB without being loud.', 'APPROVED', FALSE),
('rev-004', 'prod-005', 'demo-customer-1', 'Asha K.', 5, 'Perfect fit', 'Classic cut and washes well after multiple wears.', 'APPROVED', TRUE),
('rev-005', 'prod-009', 'demo-customer-4', 'Vikram P.', 4, 'Nice mug set', 'Good weight and glaze quality for the price.', 'APPROVED', TRUE),
('rev-006', 'prod-015', 'demo-customer-5', 'Priya D.', 3, 'Scent fades quickly', 'Smells great at first but lighter than expected after a few burns.', 'PENDING', FALSE);
