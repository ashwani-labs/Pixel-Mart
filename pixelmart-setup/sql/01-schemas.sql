-- PixelMart MySQL bootstrap (runs once on first Docker MySQL container start)
-- Creates the shared database, per-service schemas, and grants for the app user.
-- Default: database pixelmart-db, username root, password root (see .env.example)
-- Per-service table DDL is in 02–05 *.sql (same folder); runs automatically on first MySQL init.

CREATE DATABASE IF NOT EXISTS `pixelmart-db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `pixelmart-db`;

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS notify;

GRANT ALL PRIVILEGES ON `pixelmart-db`.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON auth.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON catalog.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON orders.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON notify.* TO 'root'@'%';
FLUSH PRIVILEGES;
