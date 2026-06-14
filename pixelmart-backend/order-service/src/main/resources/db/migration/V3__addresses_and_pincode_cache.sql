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
