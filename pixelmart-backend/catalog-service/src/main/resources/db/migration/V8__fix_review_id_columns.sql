-- Align review FK columns with CHAR(36) product IDs (MySQL CHAR padding breaks VARCHAR FKs).
ALTER TABLE reviews DROP FOREIGN KEY fk_reviews_product;

ALTER TABLE reviews
    MODIFY product_id CHAR(36) NOT NULL,
    MODIFY user_id CHAR(36) NOT NULL;

ALTER TABLE reviews
    ADD CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE;
