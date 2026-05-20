-- Seed categories
INSERT INTO categories (id, name, slug, parent_id, sort_order, active) VALUES
('cat-electronics', 'Electronics', 'electronics', NULL, 1, TRUE),
('cat-fashion', 'Fashion', 'fashion', NULL, 2, TRUE),
('cat-home', 'Home & Living', 'home-living', NULL, 3, TRUE);

-- Seed products (12)
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
