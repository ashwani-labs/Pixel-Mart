# PixelMart — Enhancement Roadmap

Suggestions for growing PixelMart toward patterns used by leading e-commerce sites (Amazon, Flipkart, DMart-style retail, Shopify). Use this as a backlog for storefront, admin, and backend work.

---

## Current foundation (what you already have)

| Area | Built today |
|------|-------------|
| **Catalog** | Super category → category → product hierarchy, offers, featured products, rich seed data |
| **Storefront** | Hero carousel, shop aisles, search autocomplete, sort, deals, trust bar, theme presets, dark mode |
| **Commerce** | Cart, coupons, tax, mock payments + optional Razorpay, addresses + PIN lookup, guest checkout |
| **Customer** | Wishlist, reviews (with admin moderation), orders, profile, recently viewed, FBT recommendations |
| **Admin** | Separate console, dashboard KPIs + analytics, products / categories / offers / orders / reviews / audit / settings |
| **Backend** | Microservices (auth, catalog, order, notification), email outbox, low-stock alerts, TiDB/MySQL profiles |
| **Mobile** | Bottom nav, sticky PDP add-to-cart, PWA (installable shell + offline assets) |

The largest remaining gaps vs production retail are **product variants**, **loyalty / retention**, and **photo reviews**.

---

## High-impact storefront enhancements

### 1. Smarter product discovery (highest ROI)

**Built:**

- Search autocomplete (typeahead for products and categories)
- Faceted filters: price range, in-stock only, on-sale, **minimum rating**
- “No results” page with bestsellers and related aisles
- Recently viewed products
- “Frequently bought together” on the product detail page

---

### 2. Richer product pages (PDP)

**Built:**

- Delivery ETA by PIN on PDP and cart
- Stock urgency badges
- Related products in the same category
- Image gallery, reviews, wishlist, sticky add-to-cart

**Still pending:**

- Specs / highlights table
- Photo reviews (text-only today)

---

### 3. Frictionless checkout

**Built:**

- Guest checkout
- Three-step checkout with order summary
- Mock payments (card / UPI / wallet / COD)
- **Optional Razorpay** when `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are set
- Abandoned cart emails
- Order tracking UI with status timeline

---

### 4. Trust and policy pages — **complete**

Routes: `/shipping`, `/returns`, `/faq`, `/privacy`, `/terms`

---

### 5. Mobile-first conversion — **complete**

- Sticky “Add to cart” bar on PDP
- Bottom navigation (Home, Shop, Cart, Account)
- PWA via `vite-plugin-pwa` (manifest + service worker)

---

## India-specific features

| Feature | Status |
|---------|--------|
| UPI-first checkout | ✅ Mock UPI default; Razorpay when configured |
| COD with order limits | ✅ Up to ₹2000 |
| PIN-based delivery promise | ✅ |
| ₹499 free delivery rule | ✅ |
| Regional language | ⏳ Later |
| WhatsApp order updates | ⏳ Later |

---

## Admin portal enhancements

### Operations

| Feature | Status |
|---------|--------|
| Orders DataGrid + export | ✅ |
| Homepage carousel CMS | ✅ |
| Coupon analytics | ✅ Redemptions + discount totals (7-day dashboard) |
| Customers list | ⏳ |
| Bulk stock update | ⏳ |

### Analytics

| Feature | Status |
|---------|--------|
| Revenue / orders trends (7-day) | ✅ |
| Payment method breakdown | ✅ |
| Pending review queue count | ✅ |
| Top coupon redemptions | ✅ |
| Conversion funnel | ⏳ |
| Search term analytics | ⏳ |

---

## Priority backlog

| Priority | Feature | Effort | Impact | Status |
|----------|---------|--------|--------|--------|
| **P0** | Real policy pages | Low | Trust | ✅ Done |
| **P0** | Delivery ETA by PIN | Medium | Conversion | ✅ Done |
| **P1** | Price + stock + rating filters | Medium | Discovery | ✅ Done |
| **P1** | Guest checkout | Medium | Less abandonment | ✅ Done |
| **P1** | Admin homepage banner CMS | Medium | Merchandising | ✅ Done |
| **P2** | Search autocomplete | Medium | Discovery | ✅ Done |
| **P2** | Razorpay integration | High | Production payments | ✅ Optional (env-based) |
| **P2** | Abandoned cart email | Medium | Revenue recovery | ✅ Done |
| **P2** | Frequently bought together | Medium | Higher AOV | ✅ Done |
| **P2** | Advanced admin analytics | Medium | Operations | ✅ Done |
| **P2** | PWA | Medium | Mobile retention | ✅ Done |
| **P3** | Product variants (size, color) | High | Fashion / electronics | ⏳ Pending |
| **P3** | Loyalty points / referral program | High | Retention | ⏳ Pending |
| **P3** | Photo reviews | Medium | Trust | ⏳ Pending |

---

## Implementation status (June 2026)

### Phase 1 — Trust and polish — **complete**

All items from the original Phase 1 plan are shipped.

### Phase 2 — Conversion — **complete**

All items from the original Phase 2 plan are shipped.

### Phase 3 — Growth — **complete**

| Item | Status | Notes |
|------|--------|-------|
| Search autocomplete | ✅ | `GET /catalog/search/suggest` |
| Recently viewed | ✅ | localStorage |
| On-sale filter | ✅ | `onSaleOnly` query param |
| ₹499 free delivery | ✅ | Cart + checkout |
| Mobile bottom nav | ✅ | |
| UPI-first checkout | ✅ | |
| COD order limit | ✅ | |
| Rating filter | ✅ | `minRating` on catalog API + product list UI |
| Frequently bought together | ✅ | Order-service co-purchase query + PDP section |
| Razorpay | ✅ | Optional; mock fallback when unset |
| Coupon analytics | ✅ | `coupon_code` on orders + admin dashboard |
| Advanced analytics | ✅ | Payment breakdown, top coupons, pending reviews |
| PWA | ✅ | `vite-plugin-pwa` |

### Phase 4 — Scale — **partial / backlog**

| Item | Status |
|------|--------|
| Product variants | ⏳ Not started |
| Loyalty / referrals | ⏳ Not started |
| Photo reviews | ⏳ Not started |
| Conversion funnel analytics | ⏳ Not started |
| Customer admin module | ⏳ Not started |

---

## Razorpay setup (optional)

1. Create a Razorpay account and generate test/live API keys.
2. Set on **order-service**:
   - `RAZORPAY_KEY_ID=rzp_test_...`
   - `RAZORPAY_KEY_SECRET=...`
3. Restart order-service. Checkout shows **Pay with Razorpay** as the default method.
4. Without keys, checkout continues to use mock payment methods only.

---

## Suggested next steps (Phase 4)

1. Product variants schema + PDP selector (size / color / SKU)
2. Loyalty points on order completion + referral codes
3. Review photo uploads (catalog storage + moderation)
4. Admin customer list with order history

---

*Last updated: June 2026 — align with `SETUP.md` for local run instructions.*
