# PixelMart — TiDB Cloud + Render + Vercel Deployment Checklist

## Architecture (unchanged)

| Microservice | Hibernate schema | Port |
|--------------|------------------|------|
| auth-service | `auth` | 8081 |
| catalog-service | `catalog` | 8082 |
| order-service | `orders` | 8083 |
| notification-service | `notify` | 8084 |
| api-gateway | (no DB) | 8080 |

All services share the same TiDB cluster (`DB_HOST`, `DB_PORT`, credentials). Each microservice connects to its **own schema database** via JDBC (`DB_SCHEMA`: `auth`, `catalog`, `orders`, `notify`). In MySQL/TiDB, schema = database — Hibernate `default_schema` alone does not cross databases.

## Spring profiles

| Profile | Config file | Database |
|---------|-------------|----------|
| `local` | `application-local.yml` | Local Docker MySQL |
| `dev` | `application-dev.yml` | TiDB Cloud |

Set in each service's `application.yml`:

```yaml
spring:
  profiles:
    active: local  # change to dev for TiDB Cloud
```

Or override with `SPRING_PROFILES_ACTIVE=dev` in IntelliJ / Render.

---

## Phase 1 — TiDB Cloud database

- [ ] Create a TiDB Cloud Serverless or Dedicated cluster
- [ ] Note **host**, **port** (4000), **username**, and **password** from the console
- [ ] Create or confirm database `pixelmart-db` exists (created by `01-schemas.sql`)
- [ ] Allow your IP (dev) and Render egress IPs (prod) in TiDB **Network Access**
- [ ] Run SQL bootstrap scripts **in order** via TiDB Cloud SQL Editor or `mysql` CLI:
  1. `pixelmart-setup/sql/01-schemas.sql`
  2. `pixelmart-setup/sql/02-auth-service.sql`
  3. `pixelmart-setup/sql/03-catalog-service.sql`
  4. `pixelmart-setup/sql/04-order-service.sql`
  5. `pixelmart-setup/sql/05-notification-service.sql`
- [ ] Verify schemas exist: `SHOW DATABASES;` → expect `pixelmart-db`, `auth`, `catalog`, `orders`, `notify`
- [ ] Verify seed data: `SELECT COUNT(*) FROM catalog.products;` (expect 87 rows)

### Environment variables (TiDB)

| Variable | Example | Notes |
|----------|---------|-------|
| `SPRING_PROFILES_ACTIVE` | `dev` | Loads `application-dev.yml` |
| `DB_HOST` | `gateway01.us-west-2.prod.aws.tidbcloud.com` | TiDB Cloud host |
| `DB_PORT` | `4000` | TiDB MySQL protocol port |
| `DB_USERNAME` | (from TiDB console) | Never commit real values |
| `DB_PASSWORD` | (from TiDB console) | Never commit real values |

Schema database per service (`auth`, `catalog`, `orders`, `notify`) is set in each service's `application-dev.yml`.

---

## Phase 2 — Render (backend)

- [ ] Push repo to GitHub
- [ ] In Render: **New → Blueprint** → connect repo → select `render.yaml`
- [ ] Set secret env vars on **each** data service: `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`
- [ ] Set `JWT_SECRET` on **pixelmart-auth** (or use Render-generated value; gateway inherits via blueprint)
- [ ] Set SMTP vars on **pixelmart-notification**: `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`
- [ ] Set S3 vars on **pixelmart-catalog**: `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- [ ] Confirm each service has `SPRING_PROFILES_ACTIVE=dev` (set in `render.yaml`)
- [ ] Deploy order: auth → catalog → notification → order → gateway (blueprint handles dependencies)
- [ ] Health checks pass:
  - `https://<auth>/api/auth/health`
  - `https://<catalog>/api/catalog/health`
  - `https://<order>/api/orders/health`
  - `https://<notification>/api/internal/health`
  - `https://<gateway>/actuator/health`
- [ ] Test login: `POST https://<gateway>/api/auth/login` with demo user `customer@pixelmart.local` / `Customer@123`

### Render service URLs (inter-service)

`render.yaml` wires `AUTH_SERVICE_URL`, `CATALOG_SERVICE_URL`, etc. via `fromService.hostport`. If services fail to reach each other, set explicit `https://<service>.onrender.com` URLs manually.

---

## Phase 3 — Vercel (frontend)

- [ ] Import `pixelmart-frontend` to Vercel
- [ ] Set `VITE_API_BASE_URL=https://<pixelmart-gateway>.onrender.com/api` (if you add env-based API URL support)
- [ ] Or configure Vercel rewrites to proxy `/api/*` → gateway URL
- [ ] Enable HTTPS (required for auth refresh cookies with `SameSite=None`)

---

## Phase 4 — Verification

- [ ] `mvn verify` passes locally (H2 tests unchanged)
- [ ] Storefront loads products from TiDB via gateway
- [ ] Cart, checkout, and order history work end-to-end
- [ ] Admin login works (`admin@pixelmart.local` / `Admin@123`)
- [ ] Email outbox records created on order (SMTP delivery optional)

---

## TiDB SQL compatibility review

| Feature in PixelMart SQL | TiDB support | Action |
|--------------------------|--------------|--------|
| `CREATE DATABASE` / `CREATE SCHEMA` | ✅ Supported | None |
| `JSON` columns | ✅ Supported | None |
| `MEDIUMTEXT` | ✅ Supported | None |
| `BOOLEAN` | ✅ (TINYINT) | None |
| `CHECK` constraints (`rating`, `pincode REGEXP`) | ✅ TiDB 6.6+ | None on current TiDB Cloud |
| `ON UPDATE CURRENT_TIMESTAMP` | ✅ Supported | None |
| `INSERT IGNORE` | ✅ Supported | None |
| `DATE_SUB` / `DATE_ADD` | ✅ Supported | None |
| Descending indexes (`created_at DESC`) | ✅ Supported | None |
| `GRANT` / `FLUSH PRIVILEGES` | ⚠️ Managed by TiDB Cloud | **Commented out** in `01-schemas.sql` |
| `USE auth;` per script | ✅ Supported | Keep as-is |
| Flyway / Liquibase | N/A | Disabled; SQL scripts only |

### JPA / repository notes

- All `@Query` annotations use **JPQL** (not native SQL) — no changes required
- `PESSIMISTIC_WRITE` locks on `ProductRepository` work on TiDB; under high contention, prefer short transactions
- Hibernate dialect: `org.hibernate.dialect.MySQLDialect` (TiDB is MySQL-compatible)

---

## Local development (Docker MySQL — unchanged workflow)

```bash
cp .env.example pixelmart-setup/.env
cd pixelmart-setup && docker compose up --build
```

Docker Compose sets `SPRING_PROFILES_ACTIVE=local`, `DB_HOST=mysql`, `DB_PORT=3306`.

---

## Rollback

- Keep local MySQL Docker stack for dev; production TiDB is independent
- Re-point Render env vars to previous database if needed
- SQL scripts are idempotent only where `IF NOT EXISTS` / `INSERT IGNORE` are used — use TiDB snapshots for production rollback
