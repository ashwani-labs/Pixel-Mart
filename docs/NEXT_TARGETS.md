# PixelMart — Next Targets

v1 is **complete**. This is the only planning doc — work through items below for v1.1.

## Status

| Milestone | State |
|-----------|--------|
| P0 + P1 (auth, catalog, checkout, admin, CI, wishlist, reviews, audit log) | Done |
| Items below | Backlog |

---

## Priority backlog

### P2 — Commerce & integrations

| # | Target | Notes |
|---|--------|--------|
| 1 | **Cart-level offers** | Implement `OfferScope.CART`; admin form + checkout discount line |
| 2 | **Real SMTP send** | Wire notification-service to send when `MAIL_*` configured; keep outbox fallback |
| 3 | **S3 storage** | Replace `S3StorageService` placeholder with AWS SDK upload/download |

### Production hardening

| # | Target | Notes |
|---|--------|--------|
| 4 | **Checkout idempotency** | Honor `Idempotency-Key` on `POST /api/orders/checkout` |
| 5 | **Gateway rate limiting** | Throttle `/api/auth/login` and `/register` |
| 6 | **More integration tests** | Pincode `110001`, checkout 401, order price snapshots |
| 7 | **E2E smoke suite** | Playwright: login → cart → checkout → admin audit log |

### Platform & DevOps

| # | Target | Notes |
|---|--------|--------|
| 8 | **Frontend in Docker Compose** | nginx SPA + `/api` proxy → true one-command stack |
| 9 | **Compose healthchecks** | Wait for gateway healthy before marking stack up |
| 10 | **Push CI green** | Confirm GitHub Actions on `main`; optional deploy workflow |

### UI & portfolio

| # | Target | Notes |
|---|--------|--------|
| 11 | **Tailwind 4 + shadcn/ui** | Migrate storefront (home, PLP, PDP) |
| 12 | **Admin dashboard charts** | Recharts for orders/revenue trends |
| 13 | **Portfolio screenshots** | Add PNG captures to README when demo-ready |
| 14 | **Demo video** | Record 3-minute walkthrough from README script |

---

## Suggested Week 4 plan

| Day | Theme | Targets |
|-----|--------|---------|
| D16 | Storage | #3 S3 adapter + upload E2E |
| D17 | Commerce | #1 cart offers, #4 checkout idempotency |
| D18 | Security & tests | #5 rate limit, #6 integration tests |
| D19 | DevOps | #8 frontend in compose, #7 E2E smoke |
| D20 | Polish | #11 storefront UI, #13 screenshots, #14 demo video |

---

## Definition of Done (v1.1)

- [ ] Cart-level offer applies at checkout
- [ ] S3 profile stores and serves product images in a test bucket
- [ ] Checkout idempotency prevents duplicate orders on retry
- [ ] Gateway rate limit returns 429 on auth abuse
- [ ] E2E smoke passes in CI
- [ ] `docker compose up` includes frontend (no separate `npm run dev` required)

---

## Quick link

- [README](../README.md) — setup, demo script, API map
