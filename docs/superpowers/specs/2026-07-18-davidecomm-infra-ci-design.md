# DavidEcomm — Infrastructure & Incremental CI Design

**Date:** 2026-07-18  
**Status:** Draft — pending user review  
**Project:** DavidEcomm (greenfield e-commerce)  
**Revision:** v2 — adds Performance, SEO, AI-readiness layers and Phases 5–7

---

## 1. Overview

DavidEcomm is a custom-designed e-commerce website deployed on **Vercel** with a **Next.js** storefront. The platform ships incrementally in seven feature phases, using **trunk-based development** with Vercel preview deploys per pull request. Incomplete features are hidden in production via feature flags until each phase is ready.

Four **cross-cutting layers** — Analytics, Performance, SEO, and AI-readiness — are prepared in Phase 1 and extended each phase. They are not separate release phases.

### Goals

- Ship a data-driven product catalog first, then payments, CMS/CRM, user login, and full-scale commerce ops.
- Support a custom-designed checkout experience.
- Allow guest checkout with optional account creation before full auth ships.
- Instrument analytics from Phase 1 so product clicks, views, purchases, and visitor counts are available by Phase 3.
- Keep CI simple and additive — new gates are added per phase, not new branching models.
- **Performance:** Sub-2.5s LCP on product pages at 10,000+ SKUs (mobile p75).
- **SEO:** Indexable, structured product pages with JSON-LD, sitemaps, and metadata from day one.
- **AI-readiness:** Machine-readable catalog (feeds, `llms.txt`, JSON-LD) and documented read APIs for external agents.
- **Full-scale commerce:** Inventory, domestic shipping, single-country tax, returns, and scale hardening in Phases 5–7.

### Scale Targets

| Metric | Target |
|--------|--------|
| Catalog size | 10,000+ SKUs |
| Product page LCP | < 2.5s (mobile, p75) |
| Category page TTFB | < 200ms (edge-cached) |
| CLS | < 0.1 |
| INP | < 200ms |
| Market | Single country, one currency, domestic shipping |

### Non-Goals (this spec)

- Mobile native apps (React Native / Expo).
- Multi-region deployment or multi-cloud architecture.
- Multi-currency or international tax/shipping (schema may allow future extension; not implemented).
- External CRM integrations (HubSpot, Salesforce).
- On-site AI chat, shopping assistant, or vector/RAG search.
- Real-time carrier rate APIs (flat-rate / tiered domestic shipping only in Phase 6).

---

## 2. Architecture Decision: Approach 1 — Trunk-Based + Vercel Previews

**Selected over:**
- *Environment promotion ladder* (develop → staging → main) — rejected due to operational overhead for a small team.
- *Phase milestone branches* — rejected due to merge pain and drift from production.

### Core Principles

1. **Single trunk (`main`)** — all phases merge to `main` when ready.
2. **Preview per PR** — every pull request gets a Vercel preview URL.
3. **Feature flags in production** — unfinished phase UI/routes gated until explicitly enabled.
4. **Additive CI** — pipeline jobs accumulate per phase; existing gates are never removed.
5. **Cross-cutting layers from Phase 1** — Performance, SEO, AI-readiness, and Analytics are not deferred.

### Stack Summary

| Concern | Technology |
|---------|------------|
| Hosting & frontend | Vercel + Next.js (App Router) |
| Database & auth | Supabase (Postgres + Auth in Phase 4) |
| Payments & tax | Stripe Payment Element + Stripe Tax (Phase 6) |
| CMS (Phase 3) | Sanity (headless CMS for products, categories, content) |
| CRM (Phase 3) | Custom admin dashboard backed by Supabase |
| Product analytics | PostHog |
| Performance analytics | Vercel Analytics + Lighthouse CI |
| Rate limiting | Upstash Redis (Phase 7; API keys from Phase 1) |
| Transactional email | Resend (Phase 6 — order/shipping confirmations) |
| CI/CD | GitHub Actions + Vercel deploy integration |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        Vercel (Edge + Serverless)                        │
│  Next.js App Router │ /api/v1/* │ Stripe Webhooks │ /admin │ ISR/SSG      │
└──────────┬───────────────────────────────┬───────────────────────────────┘
           │                               │
  ┌────────▼─────────┐             ┌───────▼────────┐
  │    Supabase      │             │     Stripe     │
  │  Postgres        │             │ Payment Element│
  │  Auth (Phase 4)  │             │  Tax (Ph. 6)   │
  │  Storage (images)│             │  Webhooks      │
  │  Full-text search│             └────────────────┘
  └────────┬─────────┘
           │
  ┌────────▼─────────┐   ┌────────────────┐   ┌────────────────┐
  │   Sanity CMS     │   │    PostHog     │   │  Upstash Redis │
  │  (Phase 3)       │   │  + Vercel      │   │  (Phase 7)     │
  └──────────────────┘   │  Analytics     │   └────────────────┘
                         └────────────────┘
```

### Environment Matrix

| Environment | Vercel | Supabase | Stripe | PostHog |
|-------------|--------|----------|--------|---------|
| **Local** | `next dev` | Local or staging project | Test mode | Disabled or dev project |
| **Preview (PR)** | Auto-deploy per PR | Staging project / branch | Test mode | Dev project |
| **Production** | `main` branch | Production project | Live mode | Production project |

### Feature Flags

| Flag | Default (prod) | Enabled when |
|------|----------------|--------------|
| `ENABLE_CHECKOUT` | `false` | Phase 2 complete |
| `ENABLE_ADMIN` | `false` | Phase 3 complete |
| `ENABLE_AUTH` | `false` | Phase 4 complete |
| `ENABLE_INVENTORY` | `false` | Phase 5 complete |
| `ENABLE_SHIPPING` | `false` | Phase 6 complete |
| `ENABLE_RETURNS` | `false` | Phase 7 complete |
| `ANALYTICS_ENABLED` | `true` | Always in prod; `false` in local/test |

Flags are stored in Vercel Environment Variables or Vercel Edge Config. Preview environments may enable all flags for testing.

---

## 4. Release Phases

### Phase 1 — Frontend + Data-Driven Product Catalog

**Ships:**
- Product listing (grid), category filtering, product detail pages.
- Supabase-backed product data (seeded via migrations).
- Responsive storefront matching custom design.
- Cross-cutting foundations: Analytics (Section 6), Performance (Section 14), SEO (Section 15), AI-readiness (Section 16).

**Infrastructure added:**
- Supabase project (staging + production).
- `products`, `categories`, `product_images` tables (with SEO, AI, and inventory-ready fields).
- Vercel project linked to GitHub repo.
- GitHub Actions: lint, typecheck, unit tests, build, preview deploy.
- PostHog + Vercel Analytics SDKs.
- `lib/analytics/` typed event wrapper.
- Public read API (`/api/v1/products`, `/api/v1/categories`, `/api/v1/search`).
- OpenAPI 3.1 spec, `llms.txt`, product JSON feed.
- ISR for product and category pages; `next/image` for all product images.

**CI gates (merge to `main`):**
- All PR checks pass.
- Smoke test: product listing and detail pages render with seeded data.
- Lighthouse CI: performance score ≥ 90 on product template.
- JSON-LD validates on product page.
- OpenAPI spec validates against route handlers.
- Bundle size: main JS < 150kb gzipped.

**Exit criteria:**
- Products display from Supabase on preview and production.
- Analytics events fire in PostHog.
- Product pages meet LCP < 2.5s on Lighthouse mobile emulation.
- Sitemap and robots.txt live; JSON-LD on product pages.
- Public API and product feed return valid responses.
- No checkout, admin, or auth routes accessible in production (flags off).

---

### Phase 2 — Payment System

**Ships:**
- Shopping cart (client state + optional Supabase persistence).
- Custom-designed checkout page with Stripe Payment Element.
- Guest checkout (email + shipping required).
- Optional "Create account" checkbox at checkout (stub — full auth in Phase 4).
- Order confirmation page.
- Server-side order creation via Stripe webhooks.
- Purchase JSON-LD / analytics enrichment on confirmation page.

**Infrastructure added:**
- Stripe account (test + live modes).
- Supabase tables: `orders`, `order_items`, `carts` (optional).
- API route: `POST /api/checkout/create-payment-intent`.
- API route: `POST /api/webhooks/stripe` (webhook signature verification).
- Stripe env vars per Vercel environment.

**CI gates (additive):**
- Stripe webhook integration test (test mode, mocked or Stripe CLI).
- Playwright E2E: add to cart → checkout → confirmation (test card).
- Assert server-side `purchase` analytics event fires on webhook.

**Exit criteria:**
- End-to-end purchase works in preview (Stripe test mode).
- Orders persisted in Supabase with `user_id` nullable (guest orders).
- `ENABLE_CHECKOUT=true` in production when approved.
- Purchase events tracked server-side (not client-only).

---

### Phase 3 — CMS + CRM

**Ships:**
- **CMS (Sanity):** Non-technical users edit products, categories, images, and marketing content (blog, landing pages). Product data syncs to Supabase via webhook on publish.
- **CRM (Admin dashboard):** `/admin` routes for customers, order history, support notes, and analytics summaries.
- SEO: slug-change 301 redirects, sitemap regeneration on publish, category editorial copy.
- AI: enriched product feed with full attributes; optional MCP wrapper over read API.

**Infrastructure added:**
- Sanity project (staging + production datasets).
- Sanity → Supabase sync (webhook → upsert + `revalidateTag`).
- `url_redirects` table for 301 management.
- Admin routes protected by admin role.
- Supabase tables: `support_notes`, `analytics_daily_aggregates` (optional).
- PostHog API integration for admin analytics widgets.

**CI gates (additive):**
- Admin route auth test (unauthenticated → redirect).
- CMS publish → product visible on storefront within sync SLA.
- Sitemap includes newly published product.
- Admin dashboard smoke test.

**Exit criteria:**
- Marketing team can add/edit products without a code deploy.
- Admin can view orders, customers, and top-product analytics.
- Slug changes create 301 redirects automatically.
- `ENABLE_ADMIN=true` in production when approved.

**CMS data strategy:** Sanity is the editorial source of truth for product content. Supabase remains the source of truth for orders, stock, and CRM data. A sync job (Sanity webhook → Supabase upsert) keeps catalog reads fast and triggers on-demand ISR revalidation.

---

### Phase 4 — User Login

**Ships:**
- Supabase Auth (email/password; OAuth optional later).
- Login, signup, password reset flows.
- Account page with order history.
- Guest-to-account order linking (match on email used at checkout).
- PostHog user identification (anonymous → known user merge).
- Authenticated order read API (`GET /api/v1/orders` — scoped to user).

**Infrastructure added:**
- Supabase Auth configuration.
- `profiles` table linked to `auth.users`.
- Row Level Security (RLS) policies on `orders`, `profiles`.
- Next.js middleware for protected routes.
- "Create account" checkbox from Phase 2 now functional.

**CI gates (additive):**
- Auth E2E: signup, login, view order history.
- RLS policy tests (user A cannot read user B's orders).
- Guest order merge test (checkout as guest → create account → see order).

**Exit criteria:**
- Users can register, log in, and view past orders.
- Guest orders linked to new accounts by email.
- `ENABLE_AUTH=true` in production.

---

### Phase 5 — Inventory & Stock

**Ships:**
- Real-time stock tracking per SKU.
- Out-of-stock UI (badge, disable add-to-cart).
- Low-stock alerts in admin CRM.
- Stock reservation during checkout (15-minute hold; released on timeout or payment failure).
- Oversell prevention via row-level locking on stock decrement.
- `availability` and `in_stock` reflected in JSON-LD and product feeds.

**Infrastructure added:**
- `stock_movements` audit table.
- Checkout stock reservation logic in payment-intent creation.
- Admin low-stock widget.

**CI gates (additive):**
- Concurrent checkout test: two users, one remaining unit → only one succeeds.
- Out-of-stock product cannot be added to cart.

**Exit criteria:**
- Stock decrements on successful payment; reservations expire correctly.
- Product feeds and JSON-LD show accurate availability.
- `ENABLE_INVENTORY=true` in production.

---

### Phase 6 — Shipping, Tax & Fulfillment

**Ships:**
- Domestic shipping zones (flat rate, free over threshold, weight-based tiers).
- Stripe Tax for single-country tax calculation at checkout.
- Shipping method selection at checkout.
- Order fulfillment status workflow: `paid` → `processing` → `shipped` → `delivered`.
- Shipping confirmation email via Resend.
- Tax and shipping line items on order records.

**Infrastructure added:**
- `shipping_zones`, `shipping_rates` tables.
- `orders.shipping_method`, `orders.tax_cents`, `orders.shipping_cents`, `orders.fulfillment_status`.
- Resend integration for transactional email.

**CI gates (additive):**
- Checkout E2E with tax and shipping line items asserted in order total.
- Fulfillment status transition test in admin.

**Exit criteria:**
- Checkout displays correct tax and shipping for domestic addresses.
- Admin can mark orders shipped; customer receives confirmation email.
- `ENABLE_SHIPPING=true` in production.

---

### Phase 7 — Returns, Refunds & Scale Hardening

**Ships:**
- Return request flow (customer-initiated + admin approval).
- Stripe refund integration (full and partial).
- Abandoned cart email sequence (optional).
- Rate limiting on public APIs and checkout (Upstash Redis).
- Database slow-query monitoring and CDN cache hit ratio alerts.
- Load test baseline established in CI.

**Infrastructure added:**
- `return_requests` table.
- Upstash Redis for rate limiting.
- Load test job in GitHub Actions (k6 or Artillery).

**CI gates (additive):**
- Refund E2E: admin issues refund → Stripe + order status updated.
- Load test: 100 concurrent product page requests, p95 < 500ms.

**Exit criteria:**
- Returns and refunds work end-to-end.
- Public API rate-limited at 100 req/min per API key.
- Load test passes on every release to `main`.
- `ENABLE_RETURNS=true` in production.

---

## 5. Data Model

### Phase 1 Tables

```sql
-- categories
id               uuid PRIMARY KEY
name             text NOT NULL
slug             text UNIQUE NOT NULL
parent_id        uuid REFERENCES categories(id)
meta_title       text
meta_description text
created_at       timestamptz DEFAULT now()

-- products
id               uuid PRIMARY KEY
name             text NOT NULL
slug             text UNIQUE NOT NULL
description      text
price            integer NOT NULL          -- cents
category_id      uuid REFERENCES categories(id)
sku              text UNIQUE NOT NULL
gtin             text                      -- barcode/EAN (optional)
brand            text
attributes       jsonb                     -- { "color": "Blue", "size": "M" }
meta_title       text
meta_description text
og_image_url     text
stock_quantity   integer DEFAULT 0         -- active in Phase 5
in_stock         boolean DEFAULT true      -- maintained by trigger/job in Phase 5
active           boolean DEFAULT true
search_vector    tsvector                  -- full-text search
created_at       timestamptz DEFAULT now()
updated_at       timestamptz DEFAULT now()

-- product_images
id               uuid PRIMARY KEY
product_id       uuid REFERENCES products(id) ON DELETE CASCADE
url              text NOT NULL
alt_text         text NOT NULL             -- required for SEO
sort_order       integer DEFAULT 0

-- url_redirects (used from Phase 3; schema ready in Phase 1)
id               uuid PRIMARY KEY
from_path        text UNIQUE NOT NULL
to_path          text NOT NULL
status_code      integer DEFAULT 301
created_at       timestamptz DEFAULT now()

-- api_keys (AI/agent read access)
id               uuid PRIMARY KEY
key_hash         text NOT NULL
name             text NOT NULL
rate_limit       integer DEFAULT 100       -- requests per minute
active           boolean DEFAULT true
created_at       timestamptz DEFAULT now()
```

**Indexes (Phase 1):**
- `products(slug)`, `products(category_id, active)`, `products(active, updated_at)`
- `products USING gin(search_vector)`
- `products(sku)`

### Phase 2 Tables (additive)

```sql
-- orders
id                       uuid PRIMARY KEY
user_id                  uuid REFERENCES auth.users(id)  -- nullable for guests
guest_email              text NOT NULL
stripe_payment_intent_id text UNIQUE
status                   text NOT NULL  -- pending, paid, failed, refunded
total_cents              integer NOT NULL
shipping_address         jsonb
created_at               timestamptz DEFAULT now()

-- order_items
id          uuid PRIMARY KEY
order_id    uuid REFERENCES orders(id) ON DELETE CASCADE
product_id  uuid REFERENCES products(id)
quantity    integer NOT NULL
unit_price  integer NOT NULL  -- cents at time of purchase
```

### Phase 3 Tables (additive)

```sql
-- support_notes
id              uuid PRIMARY KEY
customer_email  text NOT NULL
order_id        uuid REFERENCES orders(id) NULLABLE
note            text NOT NULL
created_by      text NOT NULL
created_at      timestamptz DEFAULT now()

-- analytics_daily_aggregates (optional)
date            date NOT NULL
product_id      uuid REFERENCES products(id)
views           integer DEFAULT 0
clicks          integer DEFAULT 0
purchases       integer DEFAULT 0
revenue_cents   integer DEFAULT 0
PRIMARY KEY (date, product_id)
```

### Phase 4 Tables (additive)

```sql
-- profiles
id          uuid PRIMARY KEY REFERENCES auth.users(id)
full_name   text
created_at  timestamptz DEFAULT now()
```

### Phase 5 Tables (additive)

```sql
-- stock_movements
id          uuid PRIMARY KEY
product_id  uuid REFERENCES products(id)
delta       integer NOT NULL          -- negative = sale, positive = restock
reason      text NOT NULL             -- sale, restock, return, reservation, release
order_id    uuid REFERENCES orders(id) NULLABLE
created_at  timestamptz DEFAULT now()

-- stock_reservations
id          uuid PRIMARY KEY
product_id  uuid REFERENCES products(id)
order_id    uuid REFERENCES orders(id) NULLABLE
quantity    integer NOT NULL
expires_at  timestamptz NOT NULL
created_at  timestamptz DEFAULT now()
```

### Phase 6 Tables (additive)

```sql
-- shipping_zones
id          uuid PRIMARY KEY
name        text NOT NULL
countries   text[] DEFAULT '{NZ}'     -- single country; array for future use

-- shipping_rates
id          uuid PRIMARY KEY
zone_id     uuid REFERENCES shipping_zones(id)
name        text NOT NULL
rate_cents  integer NOT NULL
min_weight  numeric NULLABLE
max_weight  numeric NULLABLE
free_above  integer NULLABLE          -- free shipping above this order total (cents)

-- orders (additive columns)
-- shipping_method   text
-- shipping_cents    integer
-- tax_cents         integer
-- fulfillment_status text DEFAULT 'paid'
```

### Phase 7 Tables (additive)

```sql
-- return_requests
id          uuid PRIMARY KEY
order_id    uuid REFERENCES orders(id)
user_id     uuid REFERENCES auth.users(id) NULLABLE
reason      text NOT NULL
status      text NOT NULL  -- requested, approved, rejected, refunded
refund_cents integer NULLABLE
created_at  timestamptz DEFAULT now()
```

### RLS Policies (Phase 4)

- `orders`: users can `SELECT` rows where `user_id = auth.uid()` OR `guest_email = auth.email()` (after linking).
- `profiles`: users can `SELECT` and `UPDATE` own row only.
- Admin routes use service role or dedicated admin role bypassing RLS for CRM queries.

---

## 6. Analytics Layer (Cross-Cutting)

Analytics is prepared in Phase 1 and extended each phase. It is not a separate release phase.

### Tools

| Tool | Purpose |
|------|---------|
| **PostHog** | Product events, funnels, unique visitors, session replay (optional) |
| **Vercel Analytics** | Core Web Vitals, traffic overview |
| **Stripe + Supabase** | Purchase source of truth (server-side) |

### Event Taxonomy

| Event | Phase | Trigger | Key Properties |
|-------|-------|---------|----------------|
| `page_view` | 1 | Route change | `path`, `referrer` |
| `product_impression` | 1 | Product card in viewport | `product_id`, `position`, `category` |
| `product_click` | 1 | Click product card | `product_id`, `source` |
| `product_view` | 1 | Product detail page load | `product_id`, `name`, `price` |
| `add_to_cart` | 2 | Add to cart action | `product_id`, `quantity`, `cart_value` |
| `begin_checkout` | 2 | Checkout page load | `cart_value`, `item_count` |
| `purchase` | 2 | Stripe webhook `payment_intent.succeeded` | `order_id`, `value`, `items[]` |
| `identify` | 4 | User login/signup | `user_id`, `email` |

### Implementation Rules

1. All tracking goes through `lib/analytics/track.ts` — no direct PostHog calls in components.
2. Event names and properties are typed in `lib/analytics/events.ts`.
3. `purchase` events are fired **server-side only** from the Stripe webhook handler.
4. Cookie consent banner shown before non-essential tracking (GDPR).
5. `ANALYTICS_ENABLED=false` in local dev and CI test runs.
6. Separate PostHog projects for preview vs production.
7. PostHog loaded via `next/script` with `afterInteractive` strategy.

### Phase 3 Admin Analytics Widgets

- **Most viewed products** — PostHog `product_view` count, last 7/30 days.
- **Most clicked products** — PostHog `product_click` count.
- **Conversion rate** — `purchase` / `product_view` per product.
- **Visitor count** — PostHog unique visitors, daily/weekly.
- **Revenue** — Supabase `orders` where `status = 'paid'` (authoritative).

---

## 7. CI/CD Pipeline

### Every Pull Request

```yaml
jobs:
  lint:        # ESLint + Prettier
  typecheck:   # tsc --noEmit
  test:        # Vitest unit tests
  build:       # next build
  deploy:      # Vercel preview (automatic via Git integration)
```

### Phase-Specific Additive Jobs

| Phase | Additional CI jobs |
|-------|-------------------|
| 1 | `smoke-catalog`, `lighthouse-ci`, `schema-jsonld`, `openapi-validate`, `bundle-size` |
| 2 | `test-stripe-webhook`, `e2e-checkout` (Playwright) |
| 3 | `test-admin-auth`, `test-cms-sync`, `sitemap-validate` |
| 4 | `e2e-auth`, `test-rls-policies` |
| 5 | `test-concurrent-checkout`, `test-out-of-stock` |
| 6 | `e2e-checkout-tax-shipping`, `test-fulfillment` |
| 7 | `e2e-refund`, `load-test` (k6: 100 concurrent, p95 < 500ms) |

### Branch Strategy

- `main` → production deploy.
- Feature branches: `cursor/<description>-ee03` or `feat/<description>`.
- No long-lived phase branches.

### Secrets Management

| Secret | Where | Environments |
|--------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel env | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel env | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env (server only) | Preview, Production |
| `STRIPE_SECRET_KEY` | Vercel env (server only) | Test key in preview, live in prod |
| `STRIPE_WEBHOOK_SECRET` | Vercel env (server only) | Per-environment webhook endpoint |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Vercel env | Test in preview, live in prod |
| `NEXT_PUBLIC_POSTHOG_KEY` | Vercel env | Dev project in preview, prod in production |
| `SANITY_API_TOKEN` | Vercel env (server only) | Phase 3+ |
| `RESEND_API_KEY` | Vercel env (server only) | Phase 6+ |
| `UPSTASH_REDIS_REST_URL` | Vercel env (server only) | Phase 7+ |
| `UPSTASH_REDIS_REST_TOKEN` | Vercel env (server only) | Phase 7+ |

---

## 8. Error Handling

### Stripe Webhooks

- Verify webhook signature on every request; reject unsigned payloads.
- Idempotency: check `stripe_payment_intent_id` before creating duplicate orders.
- On failure: return 500 so Stripe retries; log to Vercel function logs.
- Dead letter: orders stuck in `pending` > 1 hour flagged in admin dashboard.

### Supabase

- Use connection pooling (Supabase pooler) in serverless functions.
- RLS enabled on all user-facing tables from Phase 4.
- Migrations versioned in `supabase/migrations/` and applied via CI on deploy.

### Analytics

- `track()` calls are fire-and-forget; failures must not block UX.
- Wrap in try/catch; log errors in development only.

### Checkout

- Display Stripe error messages to user (card declined, etc.).
- On payment failure: preserve cart state; do not create order record.
- On payment failure: release stock reservations (Phase 5).

### Stock (Phase 5)

- Reservation expires after 15 minutes via scheduled cleanup or TTL check on checkout.
- Concurrent purchase attempts: second buyer receives clear out-of-stock message.

---

## 9. Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | Utilities, analytics wrapper, price formatting |
| Integration | Vitest + MSW | API routes, webhook handler |
| E2E | Playwright | Checkout (Ph. 2), auth (Ph. 4), tax/shipping (Ph. 6), refund (Ph. 7) |
| RLS | Supabase test harness | Policy isolation (Phase 4) |
| Smoke | Playwright or curl | Catalog (Ph. 1), admin (Ph. 3) |
| Performance | Lighthouse CI | Product page LCP, CLS, INP (Phase 1+) |
| Load | k6 or Artillery | 100 concurrent product pages (Phase 7) |
| Schema | Structured data tester | JSON-LD Product validation (Phase 1+) |

---

## 10. Security Considerations

- All payment processing via Stripe; no card data touches our servers (PCI scope minimized).
- Webhook endpoints verify Stripe signatures.
- Admin routes require authentication from Phase 3 (temporary admin API key or Supabase admin role; replaced by proper RBAC in Phase 4).
- RLS on all user data tables in Phase 4.
- Environment secrets never committed to git; use Vercel env vars.
- CSP headers configured for Stripe.js and PostHog domains.
- Public API keys hashed in database; raw key shown once on creation.
- Rate limiting on `/api/v1/*` endpoints (Phase 7; 100 req/min per key).

---

## 11. Open Questions (Resolved)

| Question | Decision |
|----------|----------|
| Hosting | Vercel + Next.js |
| Release model | Trunk-based + feature flags (Approach 1) |
| Product data (Phase 1) | Supabase Postgres |
| Payments UX | Stripe Payment Element (custom checkout) |
| Checkout model | Guest + optional account (Phase 2) |
| Phase 3 scope | Both CMS (Sanity) and CRM (Supabase admin) |
| Analytics | PostHog + Vercel Analytics; server-side purchase events |
| Full scale scope | Traffic/catalog size + full commerce feature set |
| AI-ready scope | Discoverability (feeds, JSON-LD, llms.txt) + API-first (OpenAPI, agent endpoints) |
| Market | Single country, one currency, domestic shipping |
| Gap integration | Extend existing spec with cross-cutting layers + Phases 5–7 |

---

## 12. Implementation Order

1. **Scaffold** — Next.js repo, Vercel project, Supabase project, GitHub Actions baseline.
2. **Phase 1** — Catalog schema, seed data, storefront, ISR, SEO, AI read API, analytics, performance CI.
3. **Phase 2** — Cart, checkout, Stripe integration, order tables, webhook, purchase analytics.
4. **Phase 3** — Sanity CMS, product sync, redirects, admin dashboard, CRM views, analytics widgets.
5. **Phase 4** — Supabase Auth, profiles, RLS, order linking, authenticated order API.
6. **Phase 5** — Stock tracking, reservations, oversell prevention, availability in feeds.
7. **Phase 6** — Domestic shipping zones, Stripe Tax, fulfillment workflow, transactional email.
8. **Phase 7** — Returns, refunds, rate limiting, load testing, scale monitoring.

Each phase merges to `main` independently. Feature flags control production visibility.

---

## 13. Success Criteria

- [ ] Phase 1: Products render from Supabase; LCP < 2.5s; JSON-LD valid; public API and feed live.
- [ ] Phase 2: Test purchase completes end-to-end; server-side purchase event logged.
- [ ] Phase 3: Non-technical user can publish a product; admin shows analytics; slug redirects work.
- [ ] Phase 4: User can sign up, log in, and see guest orders linked to their account.
- [ ] Phase 5: Concurrent checkout prevents overselling; out-of-stock products blocked.
- [ ] Phase 6: Checkout includes correct tax and shipping; fulfillment emails sent.
- [ ] Phase 7: Refunds work; load test passes; API rate limiting active.
- [ ] CI pipeline runs all applicable phase gates on every PR without manual steps.
- [ ] No unfinished phase features visible in production (feature flags enforced).

---

## 14. Performance Layer (Cross-Cutting)

Prepared in Phase 1; extended as catalog and traffic grow.

### Rendering Strategy

| Route | Strategy | Revalidate |
|-------|----------|------------|
| `/` (home) | ISR | 60s |
| `/products/[slug]` | ISR | 300s (on-demand via CMS webhook) |
| `/categories/[slug]` | ISR | 60s |
| `/search` | SSR (dynamic) | — |
| `/checkout` | SSR (dynamic) | — |
| `/admin/*` | SSR (no cache) | — |

### Caching & Assets

- `next/image` for all product images (WebP/AVIF, blur placeholder, explicit dimensions).
- Supabase Storage or Sanity CDN → Vercel Image Optimization.
- Vercel Data Cache for catalog queries (`unstable_cache` with product slug tags).
- On-demand revalidation: `revalidateTag('product-{slug}')` on Sanity publish webhook.
- `next/font` for self-hosted fonts (no layout shift).
- PostHog and Stripe.js loaded via `next/script` — `afterInteractive` or dynamic import on checkout route only.

### Catalog Scale

- Cursor-based pagination for category listings (not offset beyond page 10).
- Full-text search via Supabase `tsvector` on `name + description` (Phase 1).
- Upgrade path to Typesense or Algolia if search p95 exceeds 100ms at scale.

### CI Gates (Phase 1, maintained thereafter)

- Lighthouse CI: performance score ≥ 90 on product template.
- Bundle size budget: main JS < 150kb gzipped.
- Fail PR if LCP regression > 10% vs baseline branch.

---

## 15. SEO Layer (Cross-Cutting)

Prepared in Phase 1; enriched in Phase 3 when Sanity goes live.

### Technical SEO

| Requirement | Implementation |
|-------------|----------------|
| **Metadata** | `generateMetadata()` — title, description, OG, Twitter cards per page |
| **Canonical URLs** | Absolute canonical on all indexable pages |
| **Structured data** | JSON-LD: `Product`, `BreadcrumbList`, `Organization`, `WebSite` + `SearchAction` |
| **Sitemap** | Dynamic `app/sitemap.ts` — products, categories, static pages |
| **Robots** | `app/robots.ts` — disallow `/admin`, `/api`, `/checkout` |
| **Semantic HTML** | `<article>`, `<nav>`, proper heading hierarchy |
| **Slug redirects** | 301 via `url_redirects` table on slug change (Phase 3 webhook) |

### Content SEO (Phase 3)

- Category landing copy (editorial intro above product grid).
- Blog and guides for long-tail keywords.
- Internal linking: related products, category breadcrumbs.
- Image `alt_text` required in CMS (validation rule).

### CI Gates (Phase 1, maintained thereafter)

- JSON-LD validates on product page template.
- Sitemap generates and includes all active products.
- No duplicate `meta_title` across active products.

---

## 16. AI-Readiness Layer (Cross-Cutting)

Discoverability and API-first access for external agents. No on-site AI chat or vector search.

### Discoverability Assets

| Asset | Purpose | Location |
|-------|---------|----------|
| **`llms.txt`** | Describes catalog and API for AI crawlers | `/public/llms.txt` |
| **JSON-LD Product schema** | Shared with SEO — price, availability, SKU, brand | Product pages |
| **Product feed** | Machine-readable catalog for indexers | `/api/feeds/products.json` (paginated) |
| **Structured attributes** | Size, color, material, etc. | `products.attributes` jsonb + CMS fields |

### Public Read API (Phase 1)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/v1/products` | GET | API key | Paginated product list, filterable |
| `/api/v1/products/[slug]` | GET | API key | Single product with attributes |
| `/api/v1/categories` | GET | API key | Category tree |
| `/api/v1/search` | GET | API key | Full-text product search |
| `/api/v1/openapi.json` | GET | None | OpenAPI 3.1 specification |
| `/api/feeds/products.json` | GET | None | Public product feed (paginated) |

**Phase 4 additive:**

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/v1/orders` | GET | API key + user session | Authenticated user's orders |

### API Rules

- API keys issued via admin (Phase 3); hashed in `api_keys` table.
- Rate limiting: 100 req/min per key (Upstash Redis from Phase 7; in-memory fallback in Phase 1).
- OpenAPI spec is the contract; CI validates it matches route handlers.
- Optional MCP server (Phase 3): thin wrapper over read API for Cursor/Claude agents.

### CI Gates (Phase 1, maintained thereafter)

- OpenAPI spec validates and matches route handlers.
- Product feed returns valid JSON matching documented schema.
- `llms.txt` present and references live API base URL.

---

## 17. Phase Summary

| Phase | Ships | Cross-cutting layers |
|-------|-------|---------------------|
| **1** | Catalog | Performance, SEO, AI API/feeds, Analytics |
| **2** | Payments | + purchase tracking, checkout performance |
| **3** | CMS + CRM | + redirects, sitemap on publish, enriched feeds |
| **4** | Login | + authenticated order API, user-identified analytics |
| **5** | Inventory | + availability in JSON-LD and feeds |
| **6** | Shipping/tax | + transactional email, fulfillment in order API |
| **7** | Returns/scale | + rate limits, load tests, monitoring |
