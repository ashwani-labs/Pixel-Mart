# PixelMart — Master Build Prompt (Production-Grade E-Commerce)

## Executive summary

Build **PixelMart**, a customizable e-commerce platform for a **configurable market** (currency, locale, branding). Use a **minimal microservices architecture** in a **monorepo**, **shared MySQL** with **per-service schemas**, **JWT access + refresh** with **CUSTOMER** and **ADMIN** roles, **login required to checkout**, **multiple mock payment methods**, **India pincode lookup** via [postalpincode.in](https://api.postalpincode.in), **local image storage with S3-ready abstraction**, and a **single React SPA** with **Redux Toolkit + RTK Query**, **multiple theme presets**, and a **visually polished** customer + admin experience.

**Timeline:** 3 weeks (phased; cut scope only if behind — see “Scope guardrails”).

**Deploy:** Docker Compose only (no K8s in v1).

---

## 1. Clarified decisions (locked)

| # | Decision |
|---|----------|
| Architecture | Minimal microservices |
| Repo | Monorepo |
| Deploy | Docker Compose |
| Database | One MySQL instance, **separate schema per service** |
| Auth | JWT access + refresh; roles: `CUSTOMER`, `ADMIN` |
| Checkout | **Login required** to place order |
| Payments | Multiple **mock** methods (no real gateway in v1) |
| Market | **Admin-configurable** (currency symbol, code, tax label, etc.) |
| Pincode | `https://api.postalpincode.in/pincode/{pincode}` |
| Frontend | **One SPA** — public store + `/admin/*` protected routes |
| UI stack | **Customer storefront:** Tailwind CSS + shadcn/ui. **Admin console:** MUI v6 + MUI X Data Grid. Shared **design tokens** synced from admin branding settings. |
| Theme | Multiple presets (light variants + dark); user preference persisted |
| Images | Local filesystem v1; **storage interface** with `local` / `s3` profiles |
| v1 extras | CI, admin audit log, email (mock/SMTP-ready), wishlist, reviews |
| Branding | Default name **“PixelMart”**; **admin can customize** store name, logo, favicon, primary color |

---

## 2. System context

### 2.1 Vision

PixelMart is a portfolio-grade, production-style shop:

- Customers browse, wishlist, review, cart, checkout with saved addresses (pincode autofill).
- Admins control catalog visibility, pricing, seasonal offers, orders, market settings, and storefront branding.
- Platform is **market-customizable** (e.g. INR/India today; USD/US tomorrow via admin config).

### 2.2 Quality bar

- Clean bounded contexts per service
- DTOs only at API boundary; no entity leakage
- Global exception handling + consistent error JSON
- Flyway migrations per schema
- OpenAPI per service; gateway aggregates or links to each
- Integration tests on critical paths (auth, checkout, stock)
- GitHub Actions: build + test on PR
- README: architecture diagram, `docker compose up`, default users, screenshots

---

## 3. Minimal microservices (monorepo layout)

```
pixelmart/
├── docker-compose.yml
├── .github/workflows/ci.yml
├── docs/
│   ├── architecture.md
│   ├── api-overview.md
│   ├── PIXELMART_MASTER_SPEC.md
│   └── adr/
├── frontend/
├── gateway/
├── services/
│   ├── auth-service/
│   ├── catalog-service/
│   ├── order-service/
│   └── notification-service/
└── libs/
```

### 3.1 Service responsibilities

| Service | Port (example) | Schema | Owns |
|---------|----------------|--------|------|
| **api-gateway** | 8080 | — | Routing, CORS, JWT validation, rate limit auth routes |
| **auth-service** | 8081 | `auth` | Users, roles, register/login, refresh, logout, profile |
| **catalog-service** | 8082 | `catalog` | Products, categories, images, offers, reviews, wishlist, store settings, market config, audit log |
| **order-service** | 8083 | `orders` | Cart, addresses, checkout, orders, mock payments |
| **notification-service** | 8084 | `notify` | Email templates, order confirmation |

**Inter-service communication (v1):** synchronous REST via Gateway. Order service calls catalog internal APIs for stock/price validation (`X-Internal-Service` header).

### 3.2 Shared MySQL

- One container: `mysql:8.4`
- Schemas: `auth`, `catalog`, `orders`, `notify`
- Each service: own Flyway history in its schema
- **No cross-schema FKs**; use IDs only

---

## 4. Technology versions

| Layer | Stack |
|-------|--------|
| Java | 21 |
| Spring Boot | 3.4.x |
| Spring Cloud Gateway | 2024.0.x |
| Spring Security | 6.x |
| Spring Data JPA | Hibernate 6 |
| MySQL | 8.4 |
| Flyway | latest |
| JWT | jjwt or Spring OAuth2 Resource Server style |
| Frontend | React 19, Vite 6, TypeScript 5.x |
| State | @reduxjs/toolkit, RTK Query |
| Router | react-router 7 |
| Store UI | Tailwind 4 + shadcn/ui |
| Admin UI | MUI 6 + MUI X Data Grid |
| Forms | react-hook-form + zod |
| Charts | Recharts (admin dashboard) |
| CI | GitHub Actions |

---

## 5. Security — JWT + RBAC

### 5.1 Token model

- **Access token:** 15 min; claims: `sub`, `email`, `roles[]`, `type=access`
- **Refresh token:** 7 days; HTTP-only cookie or body + DB `refresh_tokens` (hashed); rotate on refresh
- **Logout:** invalidate refresh token record

### 5.2 Roles

| Role | Capabilities |
|------|----------------|
| `CUSTOMER` | Browse, wishlist, review, cart, own orders, manage addresses |
| `ADMIN` | Catalog/order admin APIs, branding, market config, offers, audit log |

**Rule:** No guest checkout — `POST /orders/checkout` requires `CUSTOMER` or `ADMIN`.

### 5.3 Gateway security

- Public: `GET /api/catalog/**` (read), `POST /api/auth/register`, `POST /api/auth/login`
- Authenticated: cart, checkout, wishlist, reviews (write)
- Admin-only: `/api/admin/**`

---

## 6. Domain models (per schema)

### 6.1 `auth` schema

- `users` (id, email, password_hash, name, enabled, created_at)
- `user_roles` (user_id, role: CUSTOMER | ADMIN)
- `refresh_tokens` (id, user_id, token_hash, expires_at, revoked)

### 6.2 `catalog` schema

- `categories`, `products`, `product_images`, `offers`, `reviews`, `wishlist_items`
- `store_settings` (store_name, logo_url, favicon_url, primary_color, market_currency_code, market_currency_symbol, market_locale, tax_enabled, tax_rate_percent, tax_label, support_email)
- `audit_log` (actor_user_id, action, entity_type, entity_id, old_value JSON, new_value JSON, created_at)

### 6.3 `orders` schema

- `carts`, `cart_items`, `addresses`, `orders`, `order_items`, `payments`

**Order statuses:** `PENDING` → `CONFIRMED` → `PACKED` → `SHIPPED` → `DELIVERED` | `CANCELLED`

### 6.4 `notify` schema

- `email_outbox` (to, subject, body, status: PENDING|SENT|FAILED)

---

## 7. Business rules

### 7.1 Catalog & visibility

- Storefront shows `visible = true` and active categories only
- **Effective price** = base_price after best active offer

### 7.2 Offers

- Types: `PERCENT`, `FIXED`
- Scope: `PRODUCT`, `CATEGORY`, `CART` (cart-level optional v1.1)
- Date range + optional `coupon_code`

### 7.3 Checkout (transactional)

1. Validate authenticated user
2. Validate cart not empty
3. Internal catalog call: stock, visibility, prices
4. Transaction: create order + snapshots, decrement stock, mock payment, clear cart
5. Trigger notification-service email
6. Optional `Idempotency-Key` header

### 7.4 Mock payment methods

- `MOCK_CARD`, `MOCK_UPI`, `MOCK_WALLET`, `MOCK_COD` (COD → `payment_status=PENDING`)

### 7.5 Reviews

- Verified purchase (delivered order containing product) preferred
- Admin moderate: `PENDING` | `APPROVED` | `REJECTED`

### 7.6 Pincode flow

1. User enters 6-digit pincode
2. `GET /api/orders/addresses/pincode/{pincode}` (backend proxy)
3. Backend calls postalpincode.in; cache 24h
4. Autofill city, state; dropdown if multiple post offices

### 7.7 Images (local / S3)

```java
interface StorageService {
  StoredFile store(MultipartFile file, String folder);
  Resource load(String key);
  void delete(String key);
}
```

Config: `storage.type=local|s3`. Docker volume: `./data/uploads`.

---

## 8. API contracts (high-level)

Base: `http://localhost:8080/api`

### Auth `/api/auth`

```
POST   /register, /login, /refresh, /logout
GET    /me
PATCH  /me
```

### Catalog

**Public:** settings/public, categories, products, product by slug, reviews  
**Customer:** wishlist, POST reviews  
**Admin:** CRUD categories/products, visibility, images, offers, settings, review moderate, audit-log

### Order

**Customer:** cart, addresses, pincode proxy, checkout, orders  
**Admin:** orders list, status patch

### Notification (internal)

```
POST   /internal/email/order-confirmation
```

---

## 9. Frontend (One SPA)

### Routes

```
/  /products  /products/:slug  /cart  /checkout  /orders  /wishlist  /profile  /profile/addresses
/login  /register
/admin/*  (dashboard, products, categories, offers, orders, reviews, settings, audit-log)
```

### Redux + RTK Query

- Slices: `authSlice`, `themeSlice`, `uiSlice`
- APIs: `authApi`, `catalogApi`, `orderApi`, `adminApi`
- Tags: Product, ProductList, Category, Offer, Cart, Order, Settings, Wishlist, Review, AuditLog
- 401 → refresh once → retry

### Theme presets

1. Pixel (default) 2. Ocean 3. Sunset 4. Forest 5. Mono  
Each: light + dark. Admin `primary_color` overrides `--primary`.

---

## 10. Docker Compose

Services: mysql, auth, catalog, order, notification, gateway, frontend (nginx + `/api` proxy).  
Volumes: `mysql_data`, `uploads_data`.  
Health: Spring Actuator on each service.

---

## 11. Three-week plan

**Week 1:** Monorepo, Docker, auth, catalog read, branding API, browse UI  
**Week 2:** Cart, addresses + pincode, checkout, offers, email, orders UI  
**Week 3:** Wishlist, reviews, audit log, admin grids, CI, tests, README, polish

---

## 12. Seed data

- Admin: `admin@pixelmart.local` / `Admin@123`
- Customer: `customer@pixelmart.local` / `Customer@123`
- 3 categories, 15 products, 2 offers

---

## 13. Scope guardrails

**P0:** auth, catalog, cart, checkout, mock pay, admin visibility/pricing/offers, pincode, branding, Docker, README  
**P1:** wishlist, reviews, audit log, CI, theme presets  
**P2:** coupon codes, cart-level offers, real SMTP

---

## 14. Acceptance criteria

- [ ] `docker compose up` works; README has URLs and test users
- [ ] CUSTOMER cannot access admin API or UI
- [ ] Checkout without token returns 401
- [ ] Hidden products absent from storefront
- [ ] Order snapshots preserve historical prices
- [ ] Offers apply within date range
- [ ] Pincode `110001` autofills Delhi
- [ ] All mock payment methods work
- [ ] Local images + S3 profile documented
- [ ] Theme presets persist; admin primary color applies
- [ ] Audit log on admin price/visibility changes
- [ ] CI passes on main

---

## 15. Agent mode kickoff

> Implement PixelMart per this spec. Start Week 1 Day 1: monorepo scaffold, docker-compose, auth-service, gateway, frontend shell with RTK Query + theme presets. Java 21, Spring Boot 3.4, React 19, Vite. Use Flyway. Commit per feature.

---

## Related docs

- [Daily targets (15 days)](./DAILY_TARGETS.md)
- [Architecture](./architecture.md)
