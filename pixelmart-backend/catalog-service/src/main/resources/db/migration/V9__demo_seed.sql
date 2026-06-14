-- Demo seed polish: 15 storefront products, 2 active offers, sample reviews

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
