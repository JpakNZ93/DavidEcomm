# DavidEcomm — Infrastructure & Incremental CI Design

**Date:** 2026-07-18  
**Status:** Draft — pending user review  
**Project:** DavidEcomm (greenfield e-commerce)

---

## 1. Overview

DavidEcomm is a custom-designed e-commerce website deployed on **Vercel** with a **Next.js** storefront. The platform ships incrementally in four feature phases, using **trunk-based development** with Vercel preview deploys per pull request. Incomplete features are hidden in production via feature flags until each phase is ready.

### Goals

- Ship a data-driven product catalog first, then payments, CMS/CRM, and user login.
- Support a custom-designed checkout experience.
- Allow guest checkout with optional account creation before full auth ships.
- Instrument analytics from Phase 1 so product clicks, views, purchases, and visitor counts are available by Phase 3.
- Keep CI simple and additive — new gates are added per phase, not new branching models.

### Non-Goals (this spec)

- Mobile native apps (React Native / Expo).
- Multi-region deployment or multi-cloud architecture.
- External CRM integrations (HubSpot, Salesforce) in initial phases.
- Inventory management, shipping carrier integrations, or tax automation beyond Stripe Tax (deferred).

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

### Stack Summary

| Concern | Technology |
|---------|------------|
| Hosting & frontend | Vercel + Next.js (App Router) |
| Database & auth | Supabase (Postgres + Auth in Phase 4) |
| Payments | Stripe Payment Element (embedded custom checkout) |
| CMS (Phase 3) | Sanity (headless CMS for products, categories, content) |
| CRM (Phase 3) | Custom admin dashboard backed by Supabase |
| Product analytics | PostHog |
| Performance analytics | Vercel Analytics |
| CI/CD | GitHub Actions + Vercel deploy integration |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   Vercel (Edge + Serverless)                    │
│  Next.js App Router │ API Routes │ Stripe Webhooks │ /admin     │
└──────────┬──────────────────────────────┬───────────────────────┘
           │                              │
  ┌────────▼─────────┐            ┌───────▼────────┐
  │    Supabase      │            │     Stripe     │
  │  Postgres        │            │ Payment Element│
  │  Auth (Phase 4)  │            │  Webhooks      │
  │  Storage (images)│            └────────────────┘
  └────────┬─────────┘
           │
  ┌────────▼─────────┐            ┌────────────────┐
  │   Sanity CMS     │            │    PostHog     │
  │  (Phase 3)       │            │  + Vercel      │
  │  Editorial       │            │  Analytics     │
  └──────────────────┘            └────────────────┘
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
| `ANALYTICS_ENABLED` | `true` | Always in prod; `false` in local/test |

Flags are stored in Vercel Environment Variables or Vercel Edge Config. Preview environments may enable all flags for testing.

---

## 4. Release Phases

### Phase 1 — Frontend + Data-Driven Product Catalog

**Ships:**
- Product listing (grid), category filtering, product detail pages.
- Supabase-backed product data (seeded via migrations).
- Responsive storefront matching custom design.
- Analytics foundation (see Section 6).

**Infrastructure added:**
- Supabase project (staging + production).
- `products`, `categories`, `product_images` tables.
- Vercel project linked to GitHub repo.
- GitHub Actions: lint, typecheck, unit tests, build, preview deploy.
- PostHog + Vercel Analytics SDKs.
- `lib/analytics/` typed event wrapper.

**CI gates (merge to `main`):**
- All PR checks pass.
- Smoke test: product listing and detail pages render with seeded data.

**Exit criteria:**
- Products display from Supabase on preview and production.
- `product_view`, `product_click`, `product_impression`, `page_view` events fire in PostHog.
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
- **CMS (Sanity):** Non-technical users edit products, categories, images, and marketing content (blog, landing pages). Product data syncs to or is read from Sanity with Supabase as fallback/cache for transactional queries.
- **CRM (Admin dashboard):** `/admin` routes for viewing customers, order history, support notes, and analytics summaries (top products by clicks, views, conversion rate).

**Infrastructure added:**
- Sanity project (staging + production datasets).
- Sanity → Supabase sync (webhook or build-time sync for product catalog).
- Admin routes protected by admin role (Supabase service role or dedicated admin auth before Phase 4).
- Supabase tables: `customers` (view/aggregate), `support_notes`, `analytics_daily_aggregates` (optional materialized).
- PostHog API integration for admin analytics widgets.

**CI gates (additive):**
- Admin route auth test (unauthenticated → redirect).
- CMS publish → product visible on storefront within sync SLA.
- Admin dashboard smoke test.

**Exit criteria:**
- Marketing team can add/edit products without a code deploy.
- Admin can view orders, customers, and top-product analytics.
- `ENABLE_ADMIN=true` in production when approved.

**CMS data strategy:** Sanity is the editorial source of truth for product content. Supabase remains the source of truth for orders, inventory flags (if added later), and CRM data. A sync job (Sanity webhook → Supabase upsert) keeps catalog reads fast and avoids dual-write complexity in the storefront.

---

### Phase 4 — User Login

**Ships:**
- Supabase Auth (email/password; OAuth optional later).
- Login, signup, password reset flows.
- Account page with order history.
- Guest-to-account order linking (match on email used at checkout).
- PostHog user identification (anonymous → known user merge).

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
- All four phases live.

---

## 5. Data Model

### Phase 1 Tables

```sql
-- categories
id          uuid PRIMARY KEY
name        text NOT NULL
slug        text UNIQUE NOT NULL
parent_id   uuid REFERENCES categories(id)
created_at  timestamptz DEFAULT now()

-- products
id          uuid PRIMARY KEY
name        text NOT NULL
slug        text UNIQUE NOT NULL
description text
price       integer NOT NULL  -- cents
category_id uuid REFERENCES categories(id)
active      boolean DEFAULT true
created_at  timestamptz DEFAULT now()
updated_at  timestamptz DEFAULT now()

-- product_images
id          uuid PRIMARY KEY
product_id  uuid REFERENCES products(id) ON DELETE CASCADE
url         text NOT NULL
alt_text    text
sort_order  integer DEFAULT 0
```

### Phase 2 Tables (additive)

```sql
-- orders
id              uuid PRIMARY KEY
user_id         uuid REFERENCES auth.users(id) NULLABLE  -- null for guests
guest_email     text NOT NULL
stripe_payment_intent_id text UNIQUE
status          text NOT NULL  -- pending, paid, failed, refunded
total_cents     integer NOT NULL
shipping_address jsonb
created_at      timestamptz DEFAULT now()

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
id          uuid PRIMARY KEY
customer_email text NOT NULL
order_id    uuid REFERENCES orders(id) NULLABLE
note        text NOT NULL
created_by  text NOT NULL  -- admin email
created_at  timestamptz DEFAULT now()

-- analytics_daily_aggregates (optional — populated by cron or webhook)
date        date NOT NULL
product_id  uuid REFERENCES products(id)
views       integer DEFAULT 0
clicks      integer DEFAULT 0
purchases   integer DEFAULT 0
revenue_cents integer DEFAULT 0
PRIMARY KEY (date, product_id)
```

### Phase 4 Tables (additive)

```sql
-- profiles
id          uuid PRIMARY KEY REFERENCES auth.users(id)
full_name   text
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

### Phase 3 Admin Analytics Widgets

- **Most viewed products** — PostHog `product_view` count, last 7/30 days.
- **Most clicked products** — PostHog `product_click` count.
- **Conversion rate** — `purchase` / `product_view` per product.
- **Visitor count** — PostHog unique visitors, daily/weekly.
- **Revenue** — Supabase `orders` where `status = 'paid'` (authoritative).

Data can be fetched live from PostHog API or materialized nightly into `analytics_daily_aggregates` for faster admin loads.

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
| 1 | `smoke-catalog` — product pages render |
| 2 | `test-stripe-webhook`, `e2e-checkout` (Playwright) |
| 3 | `test-admin-auth`, `test-cms-sync` |
| 4 | `e2e-auth`, `test-rls-policies` |

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

---

## 9. Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | Utilities, analytics wrapper, price formatting |
| Integration | Vitest + MSW | API routes, webhook handler |
| E2E | Playwright | Checkout flow (Phase 2), auth flow (Phase 4) |
| RLS | Supabase test harness | Policy isolation (Phase 4) |
| Smoke | Playwright or curl | Catalog pages (Phase 1), admin routes (Phase 3) |

---

## 10. Security Considerations

- All payment processing via Stripe; no card data touches our servers (PCI scope minimized).
- Webhook endpoints verify Stripe signatures.
- Admin routes require authentication from Phase 3 (temporary admin API key or Supabase admin role; replaced by proper RBAC in Phase 4).
- RLS on all user data tables in Phase 4.
- Environment secrets never committed to git; use Vercel env vars.
- CSP headers configured for Stripe.js and PostHog domains.

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

---

## 12. Implementation Order

1. **Scaffold** — Next.js repo, Vercel project, Supabase project, GitHub Actions baseline.
2. **Phase 1** — Catalog schema, seed data, storefront pages, analytics foundation.
3. **Phase 2** — Cart, checkout, Stripe integration, order tables, webhook, purchase analytics.
4. **Phase 3** — Sanity CMS, product sync, admin dashboard, CRM views, analytics widgets.
5. **Phase 4** — Supabase Auth, profiles, RLS, order linking, user-identified analytics.

Each phase merges to `main` independently. Feature flags control production visibility.

---

## 13. Success Criteria

- [ ] Phase 1: Products render from Supabase; analytics events visible in PostHog.
- [ ] Phase 2: Test purchase completes end-to-end; order in Supabase; server-side purchase event logged.
- [ ] Phase 3: Non-technical user can publish a product; admin shows top products and order list.
- [ ] Phase 4: User can sign up, log in, and see guest orders linked to their account.
- [ ] CI pipeline runs all applicable phase gates on every PR without manual steps.
- [ ] No unfinished phase features visible in production (feature flags enforced).
