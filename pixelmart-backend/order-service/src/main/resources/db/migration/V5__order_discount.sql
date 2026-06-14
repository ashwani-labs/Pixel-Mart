ALTER TABLE orders
    ADD COLUMN discount_total DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER subtotal,
    ADD COLUMN discount_label VARCHAR(255) NULL AFTER discount_total;
