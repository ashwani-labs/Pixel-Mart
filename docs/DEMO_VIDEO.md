# PixelMart demo video script

Use this 3-minute walkthrough when recording a portfolio demo. Pair with [README](../README.md) setup steps.

## Before recording

1. Run `docker compose up --build` and open `http://localhost:3000`.
2. Confirm seeded accounts work (admin + customer).
3. Hide OS notifications; use 1920×1080 browser window.

## Recording outline (~3 minutes)

| Time | Scene | Actions |
|------|--------|---------|
| 0:00–0:30 | Stack + storefront | Show home hero, deals banner, featured products, category chips |
| 0:30–1:15 | Customer journey | Login as `customer@pixelmart.local`, open PLP, PDP, add to cart, checkout with coupon `STYLE15`, place mock order |
| 1:15–2:00 | Admin console | Login as `admin@pixelmart.local`, open dashboard charts, orders list, approve a pending review, browse audit log |
| 2:00–2:30 | Platform | Briefly show `docker compose ps`, gateway health, and README architecture diagram |
| 2:30–3:00 | Wrap-up | Mention microservices, Flyway, CI + Playwright smoke, one-command compose stack |

## Suggested narration beats

- “PixelMart is a production-style e-commerce monorepo: React storefront, Spring Boot microservices, MySQL, and an API gateway.”
- “Customers browse offers, manage cart and checkout with coupon-aware pricing and order snapshots.”
- “Admins get dashboard trends, catalog controls, review moderation, and a full audit log.”
- “The whole backend plus frontend runs with `docker compose up` — no separate dev server required.”

## After recording

- Export as MP4 (H.264), upload to YouTube or Loom.
- Add the link to README under **Demo video**.
- Regenerate screenshots if UI changed: `cd e2e && npm test -- tests/screenshots.spec.ts`
