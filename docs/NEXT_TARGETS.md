# PixelMart — Next Targets

v1 and **v1.1 are complete**. Remaining polish items (#10–#14) are done in-repo; confirm CI on GitHub after push and record the demo video when ready.

## Status

| Milestone | State |
|-----------|--------|
| P0 + P1 (auth, catalog, checkout, admin, CI, wishlist, reviews, audit log) | Done |
| v1.1 (P2 + hardening + compose frontend + E2E) | Done |
| Polish (#10–#14) | Done in-repo |

---

## Completed backlog

### P2 — Commerce & integrations

| # | Target | Notes |
|---|--------|--------|
| 1 | ~~**Cart-level offers**~~ | `OfferScope.CART`, admin form, checkout discount line |
| 2 | ~~**Real SMTP send**~~ | Sends when `MAIL_USERNAME` + `MAIL_PASSWORD` set |
| 3 | ~~**S3 storage**~~ | AWS SDK via `STORAGE_TYPE=s3` |

### Production hardening

| # | Target | Notes |
|---|--------|--------|
| 4 | ~~**Checkout idempotency**~~ | `Idempotency-Key` on checkout |
| 5 | ~~**Gateway rate limiting**~~ | 20 req/min per IP on auth routes |
| 6 | ~~**Integration tests**~~ | Pincode `110001`, checkout 401, price snapshots |
| 7 | ~~**E2E smoke suite**~~ | Playwright in `e2e/` + CI job |

### Platform & DevOps

| # | Target | Notes |
|---|--------|--------|
| 8 | ~~**Frontend in Docker Compose**~~ | nginx on `:3000`, `/api` → gateway |
| 9 | ~~**Compose healthchecks**~~ | Frontend waits for gateway healthy |
| 10 | ~~**Push CI green**~~ | `.github/workflows/ci.yml` build + e2e jobs; verify on `main` after push |

### UI & portfolio

| # | Target | Notes |
|---|--------|--------|
| 11 | ~~**Tailwind 4 + shadcn/ui**~~ | Storefront home, PLP, PDP migrated |
| 12 | ~~**Admin dashboard charts**~~ | Recharts 7-day orders + revenue trends |
| 13 | ~~**Portfolio screenshots**~~ | Playwright capture → `docs/screenshots/` |
| 14 | ~~**Demo video**~~ | Script in `docs/DEMO_VIDEO.md` (record + link in README) |

---

## Definition of Done (v1.1)

- [x] Cart-level offer applies at checkout
- [x] S3 profile stores and serves product images in a test bucket
- [x] Checkout idempotency prevents duplicate orders on retry
- [x] Gateway rate limit returns 429 on auth abuse
- [x] E2E smoke passes in CI
- [x] `docker compose up` includes frontend (no separate `npm run dev` required)

---

## Quick links

- [README](../README.md) — setup, demo script, API map
- [Demo video script](DEMO_VIDEO.md) — 3-minute recording outline
