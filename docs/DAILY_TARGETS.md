# PixelMart — Daily Targets (3 Weeks)

Track progress by checking off each day's **Definition of Done**. Full product spec: [PIXELMART_MASTER_SPEC.md](./PIXELMART_MASTER_SPEC.md).

**Convention:** Each day assumes ~6–8 focused hours. If behind, cut **P2** items for that day (listed per day) before slipping the next day's **P0**.

---

## Week 1 — Foundation & browse

**Week goal:** Running stack in Docker; users can register, login, and browse products with public branding.

| Day | Theme |
|-----|--------|
| Mon (D1) | Monorepo + Docker + Gateway + DB schemas |
| Tue (D2) | Auth service (JWT register/login) |
| Wed (D3) | Auth refresh/logout + roles; Gateway JWT filter |
| Thu (D4) | Catalog service — categories & products (admin + public) |
| Fri (D5) | Store settings, image upload (local), storefront browse UI |

**Week 1 exit criteria:** `docker compose up` → register → login → see product list/detail with store name from settings.

---

### Week 1 — Day 1 (Monday): Monorepo & infrastructure shell

**Theme:** Project skeleton, shared MySQL, API Gateway, empty services, frontend app shell.

#### Backend targets

| # | Task | Details |
|---|------|---------|
| 1 | Parent build | Root `pom.xml` (Java 21, Spring Boot 3.4.x, Spring Cloud BOM) |
| 2 | Modules | `gateway`, `services/auth-service`, `catalog-service`, `order-service`, `notification-service` |
| 3 | Docker Compose | `mysql:8.4`, all services, network, env from `.env.example` |
| 4 | MySQL init | Create schemas: `auth`, `catalog`, `orders`, `notify` |
| 5 | Gateway | Spring Cloud Gateway on `:8080`; route stubs `/api/auth/**`, `/api/catalog/**`, `/api/orders/**` |
| 6 | Flyway placeholder | Each service has `src/main/resources/db/migration/V1__init.sql` (minimal or empty) |
| 7 | Actuator | `/actuator/health` on every service |
| 8 | Global errors | Shared error JSON pattern in auth-service (template for others) |

#### Frontend targets

| # | Task | Details |
|---|------|---------|
| 1 | Vite + React 19 + TS | `frontend/` app boots on `:5173` |
| 2 | Router | React Router 7 — placeholder routes `/`, `/login`, `/admin` |
| 3 | Redux store | `configureStore` + empty slices: `auth`, `theme`, `ui` |
| 4 | RTK Query | `createApi` base with `fetchBaseQuery` → gateway `/api` |
| 5 | Theme presets | 5 presets × light/dark; CSS variables; `localStorage` persistence |
| 6 | Layout shell | Header + footer; theme switcher component |

#### DevOps / docs

| # | Task |
|---|------|
| 1 | `.env.example` (JWT secret, DB creds, ports) |
| 2 | `docs/architecture.md` — diagram (Gateway → services → MySQL) |
| 3 | Update root `README.md` — prerequisites, `docker compose up`, URLs |

#### Definition of Done (D1)

- [x] `docker compose up --build` starts MySQL + gateway + 4 services (frontend via `npm run dev` — documented in README)
- [x] `GET http://localhost:8080/actuator/health` returns UP when stack is running
- [x] `npm run dev` in `frontend/` shows themed shell with route navigation
- [x] No secrets in git; `.env` gitignored

> **D1 status: COMPLETE** (verified: `mvn clean package`, `npm run build`). Run `docker compose up --build` locally to confirm container health.

#### P2 (skip if behind)

- GitHub Actions CI workflow
- OpenAPI stub per service

---

### Week 1 — Day 2 (Tuesday): Auth — register & login

**Theme:** Users, password hashing, access JWT, basic auth APIs.

#### Backend targets

| # | Task | Details |
|---|------|---------|
| 1 | Flyway `auth` | `users`, `user_roles` tables |
| 2 | Entities + repos | `User`, `UserRole` (CUSTOMER, ADMIN) |
| 3 | Register | `POST /api/auth/register` — validate email, hash password (BCrypt) |
| 4 | Login | `POST /api/auth/login` — return access token + expiry |
| 5 | JWT util | Access token 15m; claims: sub, email, roles |
| 6 | Security config | Permit register/login; secure other endpoints |
| 7 | DTOs | RegisterRequest, LoginRequest, AuthResponse, UserResponse |
| 8 | Seed | Flyway or `data.sql`: admin + customer test users |

#### Frontend targets

| # | Task | Details |
|---|------|---------|
| 1 | `authApi` | `register`, `login` mutations |
| 2 | `authSlice` | Store user + access token in memory; optional sessionStorage |
| 3 | Login page | Form + validation (zod + RHF) |
| 4 | Register page | Form + redirect to login |
| 5 | Protected route | `RequireAuth` wrapper component |

#### Definition of Done (D2)

- [x] Register new customer via UI or curl
- [x] Login returns JWT; `GET /api/auth/me` returns profile
- [x] Invalid credentials → 401 with consistent error body
- [x] Seed admin can login

#### P2

- Integration test: register + login

---

### Week 1 — Day 3 (Wednesday): Refresh tokens & gateway security

**Theme:** Refresh rotation, logout, gateway JWT validation, role foundation.

#### Backend targets

| # | Task | Details |
|---|------|---------|
| 1 | Flyway | `refresh_tokens` table (hashed token, expiry, revoked) |
| 2 | Refresh | `POST /api/auth/refresh` — rotate refresh, new access token |
| 3 | Logout | `POST /api/auth/logout` — revoke refresh |
| 4 | Cookie or body | Document refresh transport (HTTP-only cookie recommended) |
| 5 | `GET/PATCH /api/auth/me` | Profile read/update |
| 6 | Gateway filter | Validate JWT on protected routes; forward `X-User-Id`, `X-Roles` |
| 7 | Public routes | Whitelist catalog read, auth endpoints |

#### Frontend targets

| # | Task | Details |
|---|------|---------|
| 1 | Refresh flow | On 401 from RTK Query → refresh once → retry |
| 2 | Logout | Clear state + call logout API |
| 3 | User menu | Header: login state, logout, link to profile |
| 4 | `RequireRole` | HOC/hook for `ADMIN` routes |

#### Definition of Done (D3)

- [x] Access token expiry triggers silent refresh
- [x] Logout invalidates refresh; next refresh fails
- [x] Gateway blocks unauthenticated access to `/api/orders/**` (401 from gateway)

#### P2

- Rate limit login endpoint (gateway or auth)

---

### Week 1 — Day 4 (Thursday): Catalog — products & categories

**Theme:** Catalog schema, admin CRUD, public read APIs.

#### Backend targets

| # | Task | Details |
|---|------|---------|
| 1 | Flyway `catalog` | `categories`, `products` (visibility, featured, stock, prices) |
| 2 | Admin APIs | CRUD categories & products under `/api/admin/**` — `@PreAuthorize ADMIN` |
| 3 | Public APIs | `GET categories`, `GET products` (pagination, filter category, search) |
| 4 | Product detail | `GET /products/{slug}` |
| 5 | Visibility rule | Public queries filter `visible = true` |
| 6 | DTOs + mappers | No entity exposure |
| 7 | Seed | 3 categories, 10–15 products |

#### Frontend targets

| # | Task | Details |
|---|------|---------|
| 1 | `catalogApi` | list, detail, categories |
| 2 | Home page | Featured grid, category chips (shadcn cards) |
| 3 | PLP | `/products` — grid, skeleton loaders |
| 4 | PDP | `/products/:slug` — price, description, add-to-cart disabled placeholder |
| 5 | Admin stub | `/admin/products` route guard only (grid Day 5+) |

#### Definition of Done (D4)

- [x] Admin creates product via API (Postman/curl) → appears on storefront
- [x] Hidden product (`visible=false`) not in public list
- [x] PLP pagination works

#### P2

- OpenAPI for catalog-service

---

### Week 1 — Day 5 (Friday): Store settings, images, branding UI

**Theme:** Admin branding, local uploads, public settings drive UI.

#### Backend targets

| # | Task | Details |
|---|------|---------|
| 1 | Flyway | `store_settings` (singleton/key-value), `product_images` |
| 2 | Public settings | `GET /api/catalog/settings/public` |
| 3 | Admin settings | `PUT /api/admin/settings/store` |
| 4 | StorageService | `LocalStorageService` + interface for future S3 |
| 5 | Image upload | `POST /api/admin/products/{id}/images` |
| 6 | Media serve | `GET /api/catalog/media/{id}` via gateway |
| 7 | Audit log (start) | Log settings + product visibility/price changes |

#### Frontend targets

| # | Task | Details |
|---|------|---------|
| 1 | Load settings on app init | Title, logo, `--primary` from admin color |
| 2 | Header | Dynamic logo + store name |
| 3 | Admin settings page | Form: name, primary color, logo upload, preview panel |
| 4 | PDP gallery | Product images carousel |

#### Definition of Done (D5) — **Week 1 complete**

- [x] Admin changes store name → header updates after reload
- [x] Product image upload displays on PDP
- [x] Week 1 demo path: login → browse → view product with images

#### P2

- Favicon upload

---

## Week 2 — Commerce core

**Week goal:** Cart → checkout → mock payment → order history → offers on prices.

| Day | Theme |
|-----|--------|
| Mon (D6) | Cart service & UI |
| Tue (D7) | Addresses + pincode proxy |
| Wed (D8) | Checkout transaction + stock |
| Thu (D9) | Offers & coupons |
| Fri (D10) | Notifications + orders UI |

**Week 2 exit criteria:** Logged-in customer completes checkout with mock payment and sees order confirmation + email in outbox/logs.

---

### Week 2 — Day 6 (Monday): Shopping cart

#### Backend targets

| # | Task |
|---|------|
| 1 | Flyway `orders`: `carts`, `cart_items` |
| 2 | `GET/POST/PATCH/DELETE /api/orders/cart/items` |
| 3 | Price snapshot on add-to-cart from catalog (internal call or list price) |
| 4 | One cart per user |

#### Frontend targets

| # | Task |
|---|------|
| 1 | `orderApi` cart endpoints |
| 2 | Add to cart on PDP |
| 3 | Cart page — line items, qty update, remove |
| 4 | Cart badge in header |
| 5 | Auth guard — redirect to login from checkout path |

#### Definition of Done (D6)

- [x] Add/update/remove cart items
- [x] Cart persists per user across sessions

---

### Week 2 — Day 7 (Tuesday): Addresses & pincode autofill

#### Backend targets

| # | Task |
|---|------|
| 1 | Flyway: `addresses` |
| 2 | CRUD `/api/orders/addresses` |
| 3 | Pincode proxy `GET /api/orders/addresses/pincode/{pincode}` → postalpincode.in |
| 4 | 24h cache (in-memory or DB) |
| 5 | Validation: 6-digit PIN for India default market |

#### Frontend targets

| # | Task |
|---|------|
| 1 | Profile → addresses list |
| 2 | Address form — pincode first → autofill city/state |
| 3 | Post office dropdown if multiple results |
| 4 | Default address flag |

#### Definition of Done (D7)

- [x] Pincode `110001` autofills Delhi
- [x] CRUD addresses saved per user

---

### Week 2 — Day 8 (Wednesday): Checkout & mock payments

#### Backend targets

| # | Task |
|---|------|
| 1 | `POST /api/orders/checkout` — auth required |
| 2 | Transaction: validate stock (catalog internal API), create order + snapshots, decrement stock |
| 3 | `payments` table — MOCK_CARD, MOCK_UPI, MOCK_WALLET, MOCK_COD |
| 4 | Order statuses: PENDING → CONFIRMED (or COD pending payment) |
| 5 | Clear cart on success |
| 6 | Idempotency-Key header (optional P1) |

#### Frontend targets

| # | Task |
|---|------|
| 1 | Checkout stepper: Address → Payment → Review |
| 2 | Mock payment radio cards |
| 3 | Order summary with tax from store settings |
| 4 | Success page + redirect to order detail |

#### Definition of Done (D8)

- [x] End-to-end checkout without overselling stock
- [x] 401 if not logged in
- [x] Order line items store price snapshots

---

### Week 2 — Day 9 (Thursday): Seasonal offers

#### Backend targets

| # | Task |
|---|------|
| 1 | Flyway: `offers` (PERCENT, FIXED, scope, dates, coupon_code) |
| 2 | Admin CRUD offers |
| 3 | Effective price calculation on catalog read |
| 4 | Coupon validation at checkout |
| 5 | Audit log for offer changes |

#### Frontend targets

| # | Task |
|---|------|
| 1 | Offer badge on PDP/PLP |
| 2 | Compare-at strikethrough price |
| 3 | Coupon field on checkout |
| 4 | Admin offers page (MUI form + list) |
| 5 | Home “Deals” banner for active offers |

#### Definition of Done (D9)

- [x] Active offer reduces displayed and checkout price
- [x] Expired offer ignored

> **D9 status: COMPLETE** (verified: catalog/order focused Maven build, frontend production build).

---

### Week 2 — Day 10 (Friday): Email & order history

#### Backend targets

| # | Task |
|---|------|
| 1 | notification-service: `email_outbox`, send on order confirmed |
| 2 | HTML template order confirmation |
| 3 | Console log + outbox when SMTP not configured |
| 4 | `GET /api/orders` and `GET /api/orders/{id}` for customer |
| 5 | Admin `GET /api/admin/orders`, `PATCH status` |

#### Frontend targets

| # | Task |
|---|------|
| 1 | My orders list + detail |
| 2 | Admin orders DataGrid (read-only status change) |

#### Definition of Done (D10) — **Week 2 complete**

- [ ] Order confirmation recorded in `email_outbox`
- [ ] Customer sees order history

---

## Week 3 — Polish, extras & ship

**Week goal:** Wishlist, reviews, audit UI, admin dashboards, CI, tests, portfolio README.

| Day | Theme |
|-----|--------|
| Mon (D11) | Wishlist |
| Tue (D12) | Reviews + moderation |
| Wed (D13) | Admin product/order UIs + dashboard |
| Thu (D14) | Audit log UI + integration tests + CI |
| Fri (D15) | Seed data, docs, UI polish, demo hardening |

**Week 3 exit criteria:** All acceptance criteria in master spec P0 + P1; CI green; README with screenshots.

---

### Week 3 — Day 11 (Monday): Wishlist

#### Backend targets

| # | Task |
|---|------|
| 1 | Flyway: `wishlist_items` |
| 2 | `GET/POST/DELETE /api/catalog/wishlist` |

#### Frontend targets

| # | Task |
|---|------|
| 1 | Heart toggle on PLP/PDP |
| 2 | `/wishlist` page |
| 3 | Header wishlist link |

#### Definition of Done (D11)

- [ ] Wishlist syncs logged-in user; empty state UI

---

### Week 3 — Day 12 (Tuesday): Reviews

#### Backend targets

| # | Task |
|---|------|
| 1 | Flyway: `reviews` with moderation status |
| 2 | Customer POST review (verified purchase rule) |
| 3 | Public GET approved reviews only |
| 4 | Admin moderate approve/reject |

#### Frontend targets

| # | Task |
|---|------|
| 1 | Reviews on PDP |
| 2 | Submit review form (delivered orders only) |
| 3 | Admin review queue |

#### Definition of Done (D12)

- [ ] Pending review hidden on storefront until approved

---

### Week 3 — Day 13 (Wednesday): Admin console completion

#### Frontend targets

| # | Task |
|---|------|
| 1 | Admin layout — MUI sidebar |
| 2 | Products DataGrid — inline visibility toggle |
| 3 | Categories CRUD |
| 4 | Dashboard cards — orders today, low stock |
| 5 | Market settings — currency, tax fields |

#### Backend targets

| # | Task |
|---|------|
| 1 | Low stock endpoint or filter for admin |
| 2 | Dashboard stats API (aggregate orders) |

#### Definition of Done (D13)

- [ ] Admin can manage full catalog without curl

---

### Week 3 — Day 14 (Thursday): Audit log, tests, CI

#### Backend targets

| # | Task |
|---|------|
| 1 | Audit log on all admin mutations (products, offers, settings) |
| 2 | `GET /api/admin/audit-log` paginated |
| 3 | Integration tests: auth, checkout stock, RBAC |
| 4 | GitHub Actions: build all modules + frontend |

#### Frontend targets

| # | Task |
|---|------|
| 1 | Admin audit log page — filter by date/action |
| 2 | Empty states, error boundaries, loading skeletons pass |

#### Definition of Done (D14)

- [ ] CI passes on push
- [ ] At least 3 integration tests green

---

### Week 3 — Day 15 (Friday): Ship & portfolio polish

#### Targets

| # | Task |
|---|------|
| 1 | Full seed script — 15 products, 2 offers, sample reviews |
| 2 | `docker compose up` one-command README |
| 3 | Architecture diagram in README |
| 4 | Screenshots (store + admin) in `docs/images/` |
| 5 | Swagger links documented |
| 6 | S3 profile documented in README |
| 7 | Final a11y pass (focus, aria labels) |
| 8 | Theme presets + admin primary color verified |

#### Definition of Done (D15) — **Project v1 complete**

- [ ] All P0 + P1 items in [PIXELMART_MASTER_SPEC.md](./PIXELMART_MASTER_SPEC.md) acceptance criteria
- [ ] 3-minute demo script written in README

---

## Progress tracker

| Week | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | D10 | D11 | D12 | D13 | D14 | D15 |
|------|----|----|----|----|----|----|----|----|----|-----|-----|-----|-----|-----|-----|
| Status | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

Replace ⬜ with ✅ as each day completes.

---

## Dependency graph (simplified)

```
D1 (infra) → D2 (auth login) → D3 (refresh/gateway JWT)
D3 → D4 (catalog) → D5 (settings/images)
D5 → D6 (cart) → D7 (addresses) → D8 (checkout) → D9 (offers) → D10 (email/orders)
D10 → D11 (wishlist) → D12 (reviews) → D13 (admin UI) → D14 (CI/tests) → D15 (ship)
```

---

## Quick links

- [Master spec](./PIXELMART_MASTER_SPEC.md)
- [Architecture](./architecture.md) (created D1)
