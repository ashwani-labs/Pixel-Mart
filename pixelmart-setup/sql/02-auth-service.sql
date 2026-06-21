-- Auth service DDL + demo seed. Runs on first MySQL init (database: auth).
USE auth;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS schema_bootstrap (
    id TINYINT NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT IGNORE INTO schema_bootstrap (id) VALUES (1);

CREATE TABLE users (
    id CHAR(36) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    loyalty_points INT NOT NULL DEFAULT 0,
    referral_code VARCHAR(16) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT uk_users_referral_code UNIQUE (referral_code)
);

CREATE TABLE user_roles (
    user_id CHAR(36) NOT NULL,
    role VARCHAR(32) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);

CREATE TABLE refresh_tokens (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens (token_hash);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);

-- Demo users: Admin@123 / Customer@123 (BCrypt cost 10)
INSERT IGNORE INTO users (id, email, password_hash, name, enabled) VALUES
('a0000000-0000-4000-8000-000000000001', 'admin@pixelmart.local', '$2a$10$v9gk4pRQy72bTv3kHalAWean0PA.SEOem5o5o0BcgMCP2/XnJ35CO', 'PixelMart Admin', TRUE),
('a0000000-0000-4000-8000-000000000002', 'customer@pixelmart.local', '$2a$10$eJzzBhPoLqjplBXyNFIy8.xy.ToFZWerluJ0Fn7r9515jN7UUQwR6', 'Test Customer', TRUE);

INSERT IGNORE INTO user_roles (user_id, role) VALUES
('a0000000-0000-4000-8000-000000000001', 'ADMIN'),
('a0000000-0000-4000-8000-000000000002', 'CUSTOMER');

UPDATE users SET referral_code = 'PM-ADMIN01' WHERE id = 'a0000000-0000-4000-8000-000000000001';
UPDATE users SET referral_code = 'PM-CUST01' WHERE id = 'a0000000-0000-4000-8000-000000000002';

CREATE TABLE referral_redemptions (
    id CHAR(36) NOT NULL PRIMARY KEY,
    referrer_user_id CHAR(36) NOT NULL,
    referee_user_id CHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_referral_referrer FOREIGN KEY (referrer_user_id) REFERENCES users (id),
    CONSTRAINT fk_referral_referee FOREIGN KEY (referee_user_id) REFERENCES users (id),
    CONSTRAINT uk_referral_referee UNIQUE (referee_user_id)
);

CREATE INDEX idx_referral_referrer ON referral_redemptions (referrer_user_id);
