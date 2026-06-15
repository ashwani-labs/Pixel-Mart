# PixelMart — Enhancement Roadmap

Suggestions for growing PixelMart toward patterns used by leading e-commerce sites (Amazon, Flipkart, DMart-style retail, Shopify). Use this as a backlog for storefront, admin, and backend work.

---

## Current foundation (what you already have)

| Area | Built today |
|------|-------------|
| **Catalog** | Super category → category → product hierarchy, offers, featured products, rich seed data |
| **Storefront** | Hero carousel, shop aisles, search, sort, deals, trust bar, theme presets, dark mode |
| **Commerce** | Cart, coupons, tax, mock payments (card / UPI / wallet / COD), addresses + PIN lookup |
| **Customer** | Wishlist, reviews (with admin moderation), orders, profile |
| **Admin** | Separate console, dashboard KPIs, products / categories / offers / orders / reviews / audit / settings |
| **Backend** | Microservices (auth, catalog, order, notification), email outbox, low-stock alerts |

The largest gaps vs production retail are **product discovery**, **checkout friction**, **trust content**, and **growth / retention** features.

---

## High-impact storefront enhancements

### 1. Smarter product discovery (highest ROI)

Leading sites treat search as a primary entry point — buyers who search often convert at 2–3× the rate of casual browsers.

**Suggested additions:**

- Search autocomplete (typeahead for products and categories)
- Faceted filters: price range, in-stock only, discount %, rating
- “No results” page with bestsellers and related aisles instead of an empty state
- Recently viewed products
- “Frequently bought together” on the product detail page

**PixelMart today:** Basic search, category / super-category filters, and sort exist. This layer builds on that.

---

### 2. Richer product pages (PDP)

**Suggested additions:**

- Specs / highlights table (electronics, groceries)
- Delivery ETA by PIN on PDP and cart (e.g. “Delivery by Friday to 560001”)
- Stock urgency (“Only 3 left”, “Fast delivery” badge)
- Photo reviews (not only text)
- Related products in the same category or aisle

**PixelMart today:** Image gallery, reviews, wishlist, and PIN lookup API exist — surfacing delivery promise on PDP is a natural next step.

---

### 3. Frictionless checkout

**Suggested additions:**

- Guest checkout (cart and checkout currently require sign-in)
- One-page or three-step checkout with sticky order summary on mobile
- Real payment gateway (e.g. Razorpay for India: UPI, cards, wallets)
- Abandoned cart emails via the existing notification-service outbox
- Order tracking page with status timeline and tracking ID

**PixelMart today:** Mock payments are appropriate for demos; a real gateway is the main production milestone.

---

### 4. Trust and policy pages

Footer links such as Shipping, Returns, and FAQs should lead to real content pages, not generic product listings.

**Suggested pages:**

- Shipping & delivery policy
- Returns & refunds (align with TrustBar: “7-day hassle-free”)
- FAQ
- Privacy policy and terms of use

Low effort, high trust impact.

---

### 5. Mobile-first conversion

Most traffic is mobile; closing the mobile vs desktop conversion gap is a major opportunity.

**Suggested additions:**

- Sticky “Add to cart” bar on PDP when scrolling
- Bottom navigation on mobile (Home, Categories, Cart, Account)
- Image optimization (WebP / AVIF, lazy loading)
- PWA (installable app, offline shell)

---

## India-specific features

| Feature | Why it matters |
|---------|----------------|
| UPI-first checkout | Default payment method for many Indian shoppers |
| COD with order limits | Common for groceries; cap by order value |
| PIN-based delivery promise | “Deliver to 560001 by Tuesday” |
| ₹499 free delivery rule | Already shown in TrustBar — enforce in cart logic |
| Regional language (later) | Hindi (or other) labels for broader reach |
| WhatsApp order updates | Common for SMB retail in India |

---

## Admin portal enhancements

### Operations

- **Orders:** MUI DataGrid (like Products) — filters, CSV export, bulk status updates
- **Customers:** List users, view order history, disable accounts
- **Inventory:** Bulk stock update, reorder alerts, stock history
- **Homepage CMS:** Manage carousel slides from admin instead of hardcoded slides
- **Coupon analytics:** Redemptions and revenue impact

### Analytics

- Conversion funnel: browse → cart → checkout → paid
- Top products, categories, and search terms
- Revenue by payment method and aisle
- Review queue metrics (pending vs approved)

### Merchandising

- Drag-and-drop category ordering
- Featured product scheduler (time-bound deals)
- “Deal of the day” slot on homepage

---

## Inspiration by site type

| Site | Ideas worth borrowing |
|------|------------------------|
| **Amazon** | “Customers also bought”, Q&A on PDP, compare, reviews with photos |
| **Flipkart** | PIN delivery date, exchange offers, loyalty coins (later) |
| **DMart / BigBasket** | Grocery aisle UX, value packs, “₹X saved” on cart, repeat order |
| **Shopify** | Clean 3-step checkout, trust badges, email capture |
| **Myntra** | Size guide, brand/size/discount filters, wishlist-driven promos |

---

## Priority backlog

| Priority | Feature | Effort | Impact | Status |
|----------|---------|--------|--------|--------|
| **P0** | Real policy pages (shipping, returns, FAQ) | Low | Trust | ✅ Done |
| **P0** | Delivery ETA by PIN on PDP / cart | Medium | Conversion | ✅ Done |
| **P1** | Price + stock filters on product list | Medium | Discovery | ✅ Done |
| **P1** | Guest checkout | Medium | Less cart abandonment | ✅ Done |
| **P1** | Admin homepage banner CMS | Medium | Merchandising | ✅ Done |
| **P2** | Search autocomplete | Medium | Discovery | Pending |
| **P2** | Razorpay (or similar) integration | High | Production payments | Pending |
| **P2** | Abandoned cart email | Medium | Revenue recovery | ✅ Done |
| **P3** | Product variants (size, color) | High | Fashion / electronics | Pending |
| **P3** | Recommendations / recently viewed | Medium | Higher AOV | Partial (related products on PDP) |
| **P3** | Loyalty points / referral program | High | Retention | Pending |

---

## Quick wins (minimal backend change)

1. ~~Policy / FAQ static pages with real routes~~ ✅ Done
2. ~~Related products on PDP (same `categoryId`)~~ ✅ Done
3. ~~Price min/max filter (extend existing product list API)~~ ✅ Done
4. ~~Sticky mobile add-to-cart on PDP~~ ✅ Done
5. ~~Admin-managed carousel (slides in DB or settings JSON)~~ ✅ Done
6. ~~Fix footer links to point to policy routes~~ ✅ Done
7. ~~Better empty states on cart and search~~ ✅ Done (search empty state; cart already had empty state)

---

## Implementation status (June 2026)

### Phase 1 — Trust and polish — **complete**

| Item | Status | Notes |
|------|--------|-------|
| Policy pages (shipping, returns, FAQ, privacy, terms) | ✅ Done | Routes: `/shipping`, `/returns`, `/faq`, `/privacy`, `/terms` |
| Footer links to policy routes | ✅ Done | Customer care + legal links in `StoreFooter` |
| Delivery ETA by PIN on PDP / cart | ✅ Done | `DeliveryEstimate` component; public PIN lookup; metro vs standard windows |
| PDP related products | ✅ Done | Same-category suggestions, excludes current product |
| Sticky mobile add-to-cart on PDP | ✅ Done | `StickyAddToCartBar` via IntersectionObserver |
| Price range + in-stock filters | ✅ Done | `minPrice`, `maxPrice`, `inStockOnly` on catalog API |
| Search empty state with bestsellers | ✅ Done | Featured products + aisle shortcuts when no results |
| Admin homepage carousel CMS | ✅ Done | `/admin/homepage` + `hero_slides_json` in store settings |

### Phase 2 — Conversion — **in progress**

| Item | Status | Notes |
|------|--------|-------|
| Guest checkout | ✅ Done | Local guest cart + `POST /orders/guest-checkout` |
| Abandoned cart emails | ✅ Done | Hourly scheduler + notification outbox |
| Order tracking UI | ✅ Done | Timeline on order detail; tracking ID on ship |
| Admin orders DataGrid + export | ✅ Done | Filters, status updates, CSV export |

### Phase 3 — Growth — **not started**

Razorpay, search autocomplete, homepage banner CMS, recently viewed + recommendations.

### Phase 4 — Scale — **not started**

Product variants, loyalty / referrals, advanced analytics, PWA.

---

## Suggested implementation phases

### Phase 1 — Trust and polish (1–2 weeks)

- Policy pages and footer links
- Delivery ETA display using existing PIN APIs
- PDP related products and sticky add-to-cart
- Price range filter on product list

### Phase 2 — Conversion (2–4 weeks)

- Guest checkout
- Abandoned cart emails
- Order tracking UI
- Admin orders DataGrid + export

### Phase 3 — Growth (4–8 weeks)

- Razorpay integration
- Search autocomplete
- Homepage banner CMS
- Recently viewed + basic recommendations

### Phase 4 — Scale (8+ weeks)

- Product variants
- Loyalty / referrals
- Advanced analytics dashboard
- PWA and performance hardening

---

## References

Industry patterns drawn from common 2025–2026 e-commerce UX guidance:

- Mobile-first design and sub-3s load targets
- Three-step (or fewer) checkout with guest option
- Faceted search and typo-tolerant discovery
- Trust signals: reviews, delivery ETA, clear returns
- Abandoned cart recovery (e.g. 1h / 24h / 72h emails)

---

*Last updated: June 2026 — align with `SETUP.md` for local run instructions.*
