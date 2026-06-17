-- PixelMart database bootstrap (MySQL local Docker + TiDB Cloud)
-- Creates the shared connection database and per-service schemas (MySQL/TiDB: schema = database).
-- Services connect to pixelmart-db and use Hibernate default_schema per microservice.
-- Per-service table DDL is in 02–05 *.sql (same folder).

CREATE DATABASE IF NOT EXISTS `pixelmart-db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS auth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS catalog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS orders CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS notify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Local MySQL Docker only (TiDB Cloud manages users and privileges via the console):
-- GRANT ALL PRIVILEGES ON `pixelmart-db`.* TO 'root'@'%';
-- GRANT ALL PRIVILEGES ON auth.* TO 'root'@'%';
-- GRANT ALL PRIVILEGES ON catalog.* TO 'root'@'%';
-- GRANT ALL PRIVILEGES ON orders.* TO 'root'@'%';
-- GRANT ALL PRIVILEGES ON notify.* TO 'root'@'%';
-- FLUSH PRIVILEGES;
