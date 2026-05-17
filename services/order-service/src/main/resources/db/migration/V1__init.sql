-- Orders schema bootstrap (Day 6 adds carts, orders)
CREATE TABLE IF NOT EXISTS schema_bootstrap (
    id TINYINT NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT IGNORE INTO schema_bootstrap (id) VALUES (1);
