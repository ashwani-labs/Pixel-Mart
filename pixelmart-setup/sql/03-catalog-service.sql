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
-- Super categories (store aisles)
('super-electronics', 'Electronics', 'super-electronics', NULL, 1, TRUE),
('super-fashion', 'Fashion', 'super-fashion', NULL, 2, TRUE),
('super-home', 'Home & Living', 'super-home', NULL, 3, TRUE),
('super-grocery', 'Groceries & Food', 'super-grocery', NULL, 4, TRUE),
('super-beauty', 'Beauty & Personal Care', 'super-beauty', NULL, 5, TRUE),
('super-sports', 'Sports & Fitness', 'super-sports', NULL, 6, TRUE),
('super-books', 'Books & Stationery', 'super-books', NULL, 7, TRUE),
('super-kids', 'Kids & Toys', 'super-kids', NULL, 8, TRUE),
-- Electronics
('cat-electronics', 'Gadgets & Tech', 'electronics', 'super-electronics', 1, TRUE),
('cat-mobile', 'Mobile & Tablets', 'mobile-tablets', 'super-electronics', 2, TRUE),
('cat-audio', 'Audio & Headphones', 'audio-headphones', 'super-electronics', 3, TRUE),
('cat-computing', 'Laptops & Accessories', 'laptops-accessories', 'super-electronics', 4, TRUE),
-- Fashion
('cat-fashion', 'Clothing', 'clothing', 'super-fashion', 1, TRUE),
('cat-footwear', 'Footwear', 'footwear', 'super-fashion', 2, TRUE),
('cat-accessories', 'Bags & Accessories', 'bags-accessories', 'super-fashion', 3, TRUE),
('cat-ethnic', 'Ethnic & Festive', 'ethnic-festive', 'super-fashion', 4, TRUE),
-- Home & Living
('cat-home', 'Home Décor', 'home-decor', 'super-home', 1, TRUE),
('cat-kitchen', 'Kitchen & Dining', 'kitchen-dining', 'super-home', 2, TRUE),
('cat-furniture', 'Furniture', 'furniture', 'super-home', 3, TRUE),
('cat-cleaning', 'Cleaning & Laundry', 'cleaning-laundry', 'super-home', 4, TRUE),
-- Groceries
('cat-staples', 'Rice, Flour & Pulses', 'staples', 'super-grocery', 1, TRUE),
('cat-snacks', 'Snacks & Biscuits', 'snacks-biscuits', 'super-grocery', 2, TRUE),
('cat-beverages', 'Beverages', 'beverages', 'super-grocery', 3, TRUE),
('cat-dairy', 'Dairy & Breakfast', 'dairy-breakfast', 'super-grocery', 4, TRUE),
-- Beauty
('cat-skincare', 'Skin Care', 'skin-care', 'super-beauty', 1, TRUE),
('cat-haircare', 'Hair Care', 'hair-care', 'super-beauty', 2, TRUE),
('cat-grooming', 'Grooming & Hygiene', 'grooming-hygiene', 'super-beauty', 3, TRUE),
-- Sports
('cat-fitness', 'Fitness Equipment', 'fitness-equipment', 'super-sports', 1, TRUE),
('cat-sportswear', 'Activewear', 'activewear', 'super-sports', 2, TRUE),
('cat-outdoor', 'Outdoor & Camping', 'outdoor-camping', 'super-sports', 3, TRUE),
-- Books & Stationery
('cat-books', 'Books', 'books', 'super-books', 1, TRUE),
('cat-stationery', 'Stationery & Office', 'stationery-office', 'super-books', 2, TRUE),
-- Kids
('cat-toys', 'Toys & Games', 'toys-games', 'super-kids', 1, TRUE),
('cat-baby', 'Baby Care', 'baby-care', 'super-kids', 2, TRUE);

INSERT INTO products (id, category_id, name, slug, description, base_price, compare_at_price, stock_qty, visible, featured) VALUES
-- Electronics: Gadgets & Tech
('prod-001', 'cat-electronics', 'PixelBuds Pro', 'pixelbuds-pro', 'Wireless earbuds with active noise cancellation.', 4999.00, 5999.00, 120, TRUE, TRUE),
('prod-002', 'cat-electronics', 'Smart Watch X1', 'smart-watch-x1', 'Fitness tracking and notifications on your wrist.', 8999.00, NULL, 80, TRUE, TRUE),
('prod-003', 'cat-electronics', 'USB-C Hub 7-in-1', 'usb-c-hub-7in1', 'Expand your laptop ports with HDMI, USB, and SD.', 2499.00, 2999.00, 200, TRUE, FALSE),
('prod-004', 'cat-electronics', 'Mechanical Keyboard', 'mechanical-keyboard', 'RGB backlit keyboard with tactile switches.', 6499.00, NULL, 45, TRUE, TRUE),
('prod-013', 'cat-electronics', 'Wireless Mouse Mini', 'wireless-mouse-mini', 'Compact wireless mouse with silent clicks.', 1899.00, 2299.00, 140, TRUE, FALSE),
('prod-014', 'cat-electronics', 'Portable Power Bank 20000mAh', 'power-bank-20000', 'Fast-charge power bank with dual USB-C ports.', 1499.00, 1999.00, 180, TRUE, FALSE),
('prod-015', 'cat-electronics', 'Smart Home Plug 2-Pack', 'smart-plug-2pack', 'Wi-Fi plugs with scheduling and energy monitoring.', 1799.00, NULL, 95, TRUE, FALSE),
-- Mobile & Tablets
('prod-016', 'cat-mobile', 'PixelPhone 14', 'pixelphone-14', '6.5" OLED display, 128GB storage, all-day battery.', 34999.00, 39999.00, 35, TRUE, TRUE),
('prod-017', 'cat-mobile', 'PixelTab Lite 10"', 'pixeltab-lite-10', 'Lightweight tablet for reading, streaming, and notes.', 18999.00, NULL, 28, TRUE, TRUE),
('prod-018', 'cat-mobile', 'Tempered Glass Screen Guard', 'tempered-glass-guard', 'Edge-to-edge protection for popular phone models.', 299.00, 499.00, 500, TRUE, FALSE),
('prod-019', 'cat-mobile', 'Fast Charger 33W', 'fast-charger-33w', 'USB-C PD charger with braided cable included.', 899.00, NULL, 220, TRUE, FALSE),
-- Audio & Headphones
('prod-020', 'cat-audio', 'Studio Over-Ear Headphones', 'studio-over-ear', 'Balanced sound profile for music and calls.', 3999.00, 4999.00, 70, TRUE, TRUE),
('prod-021', 'cat-audio', 'Bluetooth Speaker Mini', 'bluetooth-speaker-mini', 'Pocket-size speaker with 12-hour playtime.', 2199.00, NULL, 110, TRUE, FALSE),
('prod-022', 'cat-audio', 'True Wireless Earbuds Lite', 'tw-earbuds-lite', 'Affordable earbuds with touch controls.', 1299.00, 1699.00, 160, TRUE, FALSE),
-- Laptops & Accessories
('prod-023', 'cat-computing', 'Ultrabook 14" 16GB', 'ultrabook-14-16gb', 'Thin laptop with SSD and backlit keyboard.', 54999.00, 59999.00, 18, TRUE, TRUE),
('prod-024', 'cat-computing', 'Laptop Stand Aluminum', 'laptop-stand-aluminum', 'Ergonomic riser with cable routing slot.', 1299.00, NULL, 85, TRUE, FALSE),
('prod-025', 'cat-computing', 'Wireless Keyboard & Mouse Combo', 'wireless-kb-mouse-combo', 'Quiet keys and ambidextrous mouse for home office.', 2499.00, 2999.00, 62, TRUE, FALSE),
-- Fashion: Clothing
('prod-005', 'cat-fashion', 'Classic Denim Jacket', 'classic-denim-jacket', 'Timeless denim jacket for all seasons.', 3999.00, 4999.00, 60, TRUE, TRUE),
('prod-007', 'cat-fashion', 'Cotton Crew Tee 3-Pack', 'cotton-crew-tee-3pack', 'Soft cotton tees in black, white, and grey.', 1299.00, 1599.00, 150, TRUE, FALSE),
('prod-026', 'cat-fashion', 'Slim Fit Chinos', 'slim-fit-chinos', 'Stretch cotton chinos in navy and khaki.', 2199.00, NULL, 88, TRUE, FALSE),
('prod-027', 'cat-fashion', 'Floral Summer Dress', 'floral-summer-dress', 'Lightweight midi dress for warm days.', 2799.00, 3499.00, 42, TRUE, TRUE),
('prod-028', 'cat-fashion', 'Wool Blend Sweater', 'wool-blend-sweater', 'Cozy crew-neck sweater for cooler evenings.', 3299.00, NULL, 55, TRUE, FALSE),
-- Footwear
('prod-006', 'cat-footwear', 'Running Sneakers', 'running-sneakers', 'Lightweight sneakers built for daily runs.', 5499.00, NULL, 90, TRUE, FALSE),
('prod-029', 'cat-footwear', 'Casual Slip-On Loafers', 'casual-slip-on-loafers', 'Easy everyday loafers with cushioned insole.', 2999.00, 3799.00, 74, TRUE, FALSE),
('prod-030', 'cat-footwear', 'Sports Sandals', 'sports-sandals', 'Adjustable straps and grippy sole for trails.', 1899.00, NULL, 65, TRUE, FALSE),
('prod-031', 'cat-footwear', 'Formal Leather Shoes', 'formal-leather-shoes', 'Polished oxford-style shoes for work.', 4499.00, 5499.00, 38, TRUE, TRUE),
-- Bags & Accessories
('prod-008', 'cat-accessories', 'Leather Belt', 'leather-belt', 'Genuine leather belt with brushed buckle.', 999.00, NULL, 110, TRUE, FALSE),
('prod-032', 'cat-accessories', 'Canvas Tote Bag', 'canvas-tote-bag', 'Durable everyday tote with inner pocket.', 899.00, NULL, 95, TRUE, FALSE),
('prod-033', 'cat-accessories', 'Polarized Sunglasses', 'polarized-sunglasses', 'UV400 lenses with lightweight acetate frame.', 1599.00, 1999.00, 120, TRUE, FALSE),
('prod-034', 'cat-accessories', 'Travel Backpack 30L', 'travel-backpack-30l', 'Laptop sleeve, water bottle pocket, and rain cover.', 3499.00, NULL, 48, TRUE, TRUE),
-- Ethnic & Festive
('prod-035', 'cat-ethnic', 'Cotton Kurta Set', 'cotton-kurta-set', 'Festive kurta with matching bottom, breathable weave.', 2499.00, 2999.00, 52, TRUE, FALSE),
('prod-036', 'cat-ethnic', 'Silk Blend Saree', 'silk-blend-saree', 'Elegant drape with contrast border.', 4999.00, NULL, 24, TRUE, TRUE),
('prod-037', 'cat-ethnic', 'Embroidered Dupatta', 'embroidered-dupatta', 'Lightweight dupatta with mirror work detail.', 1299.00, 1599.00, 40, TRUE, FALSE),
-- Home Décor
('prod-009', 'cat-home', 'Ceramic Mug Set', 'ceramic-mug-set', 'Set of 4 handcrafted ceramic mugs.', 1499.00, NULL, 75, TRUE, TRUE),
('prod-011', 'cat-home', 'Throw Pillow Pair', 'throw-pillow-pair', 'Decorative pillows for sofa or bed.', 1799.00, NULL, 100, TRUE, FALSE),
('prod-038', 'cat-home', 'Wall Art Canvas Set', 'wall-art-canvas-set', 'Set of 3 abstract prints ready to hang.', 2999.00, 3799.00, 30, TRUE, FALSE),
('prod-039', 'cat-home', 'Indoor Plant Pot Trio', 'indoor-plant-pot-trio', 'Matte ceramic pots in small, medium, and large.', 1199.00, NULL, 68, TRUE, FALSE),
-- Kitchen & Dining
('prod-040', 'cat-kitchen', 'Non-Stick Cookware Set 5pc', 'nonstick-cookware-5pc', 'Induction-friendly pans with glass lids.', 3999.00, 4999.00, 44, TRUE, TRUE),
('prod-041', 'cat-kitchen', 'Stainless Steel Lunch Box', 'steel-lunch-box', 'Leak-proof tiffin with 3 compartments.', 699.00, NULL, 130, TRUE, FALSE),
('prod-042', 'cat-kitchen', 'Electric Kettle 1.7L', 'electric-kettle-17l', 'Boil-dry protection and 360° swivel base.', 1899.00, 2299.00, 72, TRUE, FALSE),
-- Furniture
('prod-010', 'cat-furniture', 'Desk Lamp LED', 'desk-lamp-led', 'Adjustable LED desk lamp with warm/cool modes.', 2199.00, 2799.00, 55, TRUE, FALSE),
('prod-043', 'cat-furniture', 'Ergonomic Office Chair', 'ergonomic-office-chair', 'Mesh back, lumbar support, and height adjustment.', 8999.00, 10999.00, 15, TRUE, TRUE),
('prod-044', 'cat-furniture', 'Bookshelf 5-Tier', 'bookshelf-5-tier', 'Engineered wood shelf for living room or study.', 5499.00, NULL, 22, TRUE, FALSE),
-- Cleaning & Laundry
('prod-045', 'cat-cleaning', 'Laundry Detergent 2kg', 'laundry-detergent-2kg', 'Front-load and top-load compatible detergent.', 449.00, 549.00, 200, TRUE, FALSE),
('prod-046', 'cat-cleaning', 'Microfiber Mop Set', 'microfiber-mop-set', 'Reusable pads and extendable handle.', 999.00, NULL, 85, TRUE, FALSE),
('prod-047', 'cat-cleaning', 'Air Freshener Refill 3-Pack', 'air-freshener-refill-3pack', 'Long-lasting room freshener refills.', 599.00, 749.00, 140, TRUE, FALSE),
-- Groceries: Staples
('prod-048', 'cat-staples', 'Basmati Rice 5kg', 'basmati-rice-5kg', 'Aged long-grain basmati for biryani and pulao.', 649.00, 799.00, 300, TRUE, TRUE),
('prod-049', 'cat-staples', 'Whole Wheat Atta 10kg', 'whole-wheat-atta-10kg', 'Stone-ground flour for soft rotis.', 449.00, NULL, 250, TRUE, FALSE),
('prod-050', 'cat-staples', 'Toor Dal 1kg', 'toor-dal-1kg', 'Unpolished lentils rich in protein.', 149.00, 179.00, 400, TRUE, FALSE),
('prod-051', 'cat-staples', 'Sunflower Oil 1L', 'sunflower-oil-1l', 'Refined cooking oil for everyday meals.', 189.00, NULL, 350, TRUE, FALSE),
-- Snacks
('prod-052', 'cat-snacks', 'Masala Potato Chips 6-Pack', 'masala-chips-6pack', 'Crispy chips with classic Indian spice blend.', 199.00, 249.00, 500, TRUE, FALSE),
('prod-053', 'cat-snacks', 'Assorted Cookies Tin', 'assorted-cookies-tin', 'Butter and chocolate cookies for tea time.', 349.00, NULL, 180, TRUE, TRUE),
('prod-054', 'cat-snacks', 'Roasted Almonds 200g', 'roasted-almonds-200g', 'Lightly salted snack pack.', 299.00, 349.00, 220, TRUE, FALSE),
-- Beverages
('prod-055', 'cat-beverages', 'Green Tea 50 Bags', 'green-tea-50-bags', 'Antioxidant-rich tea for daily wellness.', 249.00, NULL, 160, TRUE, FALSE),
('prod-056', 'cat-beverages', 'Instant Coffee 200g', 'instant-coffee-200g', 'Rich aroma freeze-dried coffee.', 449.00, 499.00, 190, TRUE, FALSE),
('prod-057', 'cat-beverages', 'Mango Juice 1L (4-Pack)', 'mango-juice-4pack', 'No added preservatives, family pack.', 399.00, NULL, 120, TRUE, FALSE),
-- Dairy & Breakfast
('prod-058', 'cat-dairy', 'Greek Yogurt 400g', 'greek-yogurt-400g', 'High-protein cup with live cultures.', 89.00, NULL, 280, TRUE, FALSE),
('prod-059', 'cat-dairy', 'Multigrain Cereal 750g', 'multigrain-cereal-750g', 'Fortified breakfast cereal with nuts.', 349.00, 399.00, 150, TRUE, TRUE),
('prod-060', 'cat-dairy', 'Honey 500g', 'honey-500g', 'Pure multifloral honey for toast and tea.', 299.00, NULL, 95, TRUE, FALSE),
-- Skin Care
('prod-061', 'cat-skincare', 'Vitamin C Face Serum', 'vitamin-c-serum', 'Brightening serum for dull skin.', 899.00, 1199.00, 90, TRUE, TRUE),
('prod-062', 'cat-skincare', 'SPF 50 Sunscreen 50ml', 'spf50-sunscreen', 'Lightweight matte finish for daily use.', 599.00, NULL, 130, TRUE, FALSE),
('prod-063', 'cat-skincare', 'Moisturizing Face Wash', 'moisturizing-face-wash', 'Gentle cleanser for normal to dry skin.', 349.00, 399.00, 175, TRUE, FALSE),
-- Hair Care
('prod-064', 'cat-haircare', 'Keratin Shampoo 340ml', 'keratin-shampoo', 'Frizz control for smooth, shiny hair.', 449.00, NULL, 140, TRUE, FALSE),
('prod-065', 'cat-haircare', 'Hair Oil 200ml', 'hair-oil-200ml', 'Blend of coconut and almond oils.', 249.00, 299.00, 200, TRUE, FALSE),
('prod-066', 'cat-haircare', 'Professional Hair Dryer', 'professional-hair-dryer', 'Ionic dryer with cool-shot button.', 2499.00, 2999.00, 35, TRUE, TRUE),
-- Grooming
('prod-067', 'cat-grooming', 'Men''s Grooming Kit', 'mens-grooming-kit', 'Trimmer, comb, and travel pouch.', 1999.00, NULL, 58, TRUE, FALSE),
('prod-068', 'cat-grooming', 'Body Wash 750ml', 'body-wash-750ml', 'Refreshing shower gel with aloe.', 399.00, 449.00, 165, TRUE, FALSE),
('prod-069', 'cat-grooming', 'Toothpaste Family Pack', 'toothpaste-family-pack', 'Fluoride toothpaste, pack of 3.', 249.00, NULL, 310, TRUE, FALSE),
-- Fitness
('prod-070', 'cat-fitness', 'Yoga Mat 6mm', 'yoga-mat-6mm', 'Non-slip mat with carrying strap.', 1299.00, 1599.00, 80, TRUE, TRUE),
('prod-071', 'cat-fitness', 'Adjustable Dumbbell Pair', 'adjustable-dumbbell-pair', '5–20 kg per hand with quick-lock plates.', 6999.00, NULL, 20, TRUE, FALSE),
('prod-072', 'cat-fitness', 'Resistance Bands Set', 'resistance-bands-set', 'Five levels with door anchor and handles.', 899.00, 1099.00, 95, TRUE, FALSE),
-- Activewear
('prod-073', 'cat-sportswear', 'Dry-Fit Training T-Shirt', 'dryfit-training-tee', 'Moisture-wicking tee for gym sessions.', 999.00, NULL, 110, TRUE, FALSE),
('prod-074', 'cat-sportswear', 'Compression Leggings', 'compression-leggings', 'High-rise leggings with phone pocket.', 1799.00, 2199.00, 70, TRUE, FALSE),
-- Outdoor
('prod-075', 'cat-outdoor', 'Camping Lantern LED', 'camping-lantern-led', 'Rechargeable lantern with dimmer modes.', 1499.00, NULL, 45, TRUE, FALSE),
('prod-076', 'cat-outdoor', 'Hiking Backpack 40L', 'hiking-backpack-40l', 'Ventilated back panel and rain cover.', 4299.00, 4999.00, 28, TRUE, TRUE),
-- Books
('prod-077', 'cat-books', 'Atomic Habits (Paperback)', 'atomic-habits-paperback', 'Bestseller on building good habits.', 499.00, 599.00, 85, TRUE, TRUE),
('prod-078', 'cat-books', 'Indian Cookbook', 'indian-cookbook', '200 regional recipes with step-by-step photos.', 699.00, NULL, 60, TRUE, FALSE),
-- Stationery
('prod-079', 'cat-stationery', 'Notebook Pack A5 (6)', 'notebook-pack-a5', 'Ruled pages with sturdy covers for school or work.', 399.00, 499.00, 200, TRUE, FALSE),
('prod-080', 'cat-stationery', 'Gel Pen Set 10 Colors', 'gel-pen-set-10', 'Smooth-writing pens for notes and journaling.', 199.00, NULL, 320, TRUE, FALSE),
-- Toys
('prod-081', 'cat-toys', 'Building Blocks 100pc', 'building-blocks-100pc', 'Colorful blocks for creative play ages 3+.', 899.00, 1099.00, 75, TRUE, TRUE),
('prod-082', 'cat-toys', 'Remote Control Car', 'remote-control-car', 'Rechargeable RC car with LED headlights.', 1499.00, NULL, 50, TRUE, FALSE),
('prod-083', 'cat-toys', 'Board Game Family Pack', 'board-game-family-pack', 'Strategy and party games for 4–8 players.', 1299.00, 1599.00, 40, TRUE, FALSE),
-- Baby Care
('prod-084', 'cat-baby', 'Baby Diapers Size M (48)', 'baby-diapers-size-m', 'Ultra-absorbent diapers with wetness indicator.', 899.00, NULL, 120, TRUE, FALSE),
('prod-085', 'cat-baby', 'Gentle Baby Wipes 80ct', 'gentle-baby-wipes', 'Fragrance-free wipes for sensitive skin.', 249.00, 299.00, 180, TRUE, FALSE),
('prod-086', 'cat-baby', 'Soft Cotton Onesies 3-Pack', 'cotton-onesies-3pack', 'Snap-button bodysuits for infants 0–6 months.', 1199.00, NULL, 65, TRUE, TRUE),
-- Home (scented candle moved here)
('prod-087', 'cat-home', 'Scented Candle Set', 'scented-candle-set', 'Set of 3 soy candles: cedar, vanilla, citrus.', 1299.00, 1599.00, 65, TRUE, TRUE),
-- Admin-only draft
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
    hero_slides_json JSON NULL,
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
    'default', 'PixelMart', '#0460a9', 'INR', '₹', 'en-IN', TRUE, 18.00, 'GST', 'support@pixelmart.local'
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
('offer-grocery-weekly', 'Weekly grocery savings', 'PERCENT', 'CATEGORY', NULL, 'cat-staples', 5.00, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 14 DAY), NULL, TRUE),
('offer-beauty-bogo', 'Beauty essentials', 'PERCENT', 'CATEGORY', NULL, 'cat-skincare', 12.00, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 21 DAY), 'GLOW12', TRUE),
('offer-expired-mugs', 'Expired mug markdown', 'FIXED', 'PRODUCT', 'prod-009', NULL, 250.00, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 DAY), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), NULL, TRUE),
('offer-fashion-coupon', 'Fashion coupon', 'PERCENT', 'CATEGORY', NULL, 'cat-fashion', 15.00, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), 'STYLE15', TRUE),
('offer-sports-gear', 'Sports gear sale', 'PERCENT', 'CATEGORY', NULL, 'cat-fitness', 8.00, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), NULL, TRUE);

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

UPDATE offers SET active = FALSE WHERE id = 'offer-expired-mugs';

INSERT INTO reviews (id, product_id, user_id, reviewer_name, rating, title, body, status, verified_purchase) VALUES
('rev-001', 'prod-001', 'demo-customer-1', 'Asha K.', 5, 'Excellent ANC', 'Blocks commute noise well and battery lasts all week.', 'APPROVED', TRUE),
('rev-002', 'prod-001', 'demo-customer-2', 'Rahul M.', 4, 'Solid daily driver', 'Comfortable fit. Wish the case was slightly smaller.', 'APPROVED', TRUE),
('rev-003', 'prod-004', 'demo-customer-3', 'Neha S.', 5, 'Typing feel is great', 'Tactile switches and bright RGB without being loud.', 'APPROVED', FALSE),
('rev-004', 'prod-005', 'demo-customer-1', 'Asha K.', 5, 'Perfect fit', 'Classic cut and washes well after multiple wears.', 'APPROVED', TRUE),
('rev-005', 'prod-009', 'demo-customer-4', 'Vikram P.', 4, 'Nice mug set', 'Good weight and glaze quality for the price.', 'APPROVED', TRUE),
('rev-006', 'prod-087', 'demo-customer-5', 'Priya D.', 3, 'Scent fades quickly', 'Smells great at first but lighter than expected after a few burns.', 'PENDING', FALSE),
('rev-007', 'prod-016', 'demo-customer-2', 'Rahul M.', 5, 'Great phone', 'Smooth display and camera punches above its price.', 'APPROVED', TRUE),
('rev-008', 'prod-048', 'demo-customer-3', 'Neha S.', 5, 'Best basmati', 'Long grains and aroma — reordering every month.', 'APPROVED', TRUE),
('rev-009', 'prod-061', 'demo-customer-4', 'Vikram P.', 4, 'Skin feels brighter', 'Light texture, no sticky finish. Using daily for 3 weeks.', 'APPROVED', FALSE),
('rev-010', 'prod-077', 'demo-customer-1', 'Asha K.', 5, 'Must read', 'Practical advice I actually applied at work.', 'APPROVED', TRUE);
