# DavidEcomm — Estimation & Pricing Model

**Document type:** Cost planning & client proposal reference  
**Date:** July 2026  
**Currency:** AUD (Australian dollars) unless noted  
**Scope:** Platform and infrastructure per [Infrastructure & CI Design](./superpowers/specs/2026-07-18-davidecomm-infra-ci-design.md)

---

## Purpose

This document provides an all-in cost model for DavidEcomm — **vendor/SaaS running costs**, **payment processing**, and **labour** — for internal planning and client proposals.

Figures are **planning ranges**, not fixed quotes. Actual costs depend on who builds the platform, traffic volume, order value, and scope per phase.

---

## Executive Summary

| Scenario | Build (labour) | Year 1 tools/hosting | Stripe (on $500k revenue)* | Year 1 total (indicative) |
|----------|----------------|----------------------|----------------------------|---------------------------|
| **MVP — Phases 1–2** (catalogue + payments) | $17,000 – $48,000 | $600 – $2,000 | ~$9,000 | **~$27,000 – $59,000** |
| **Full platform — Phases 1–7** | $41,000 – $115,000 | $1,500 – $5,000 | ~$9,000 | **~$52,000 – $129,000** |
| **Self-build** (owner time) | Opportunity cost of 350–525 hrs | $500 – $3,000 | % of sales | Lowest cash; highest time |

\*Stripe estimate assumes ~$500k annual online revenue at ~1.75% + $0.30 per domestic card transaction. Adjust proportionally for actual turnover.

**Key message for clients:** Monthly platform costs start around **$0–50** at launch. **Labour is the largest cost.** Phased delivery lets the business **start selling after Phase 2** without paying for Phases 3–7 upfront.

---

## 1. Monthly Running Costs (Vendor / SaaS)

Ongoing costs paid to third-party services. Excludes labour and Stripe transaction fees.

### 1.1 Startup / Low Traffic

**Profile:** Phases 1–2 live, fewer than ~500 orders/month, small catalogue.

| Service | Role | Monthly cost |
|---------|------|--------------|
| Vercel | Hosting & previews | $0 – $20 |
| Supabase | Database & auth | $0 – $25 |
| Stripe | Payments | $0 monthly (per-transaction only) |
| PostHog | Product analytics | $0 (free tier) |
| Sanity | CMS (Phase 3+) | $0 (free tier) |
| Resend | Transactional email (Phase 6+) | $0 – $20 |
| GitHub | Code repository & CI | $0 – $4 |
| Domain | .com.au or similar | ~$1 – $4 (amortised) |

**Estimated monthly total:** **$0 – $50/month** (excluding Stripe % on sales).

### 1.2 Growth

**Profile:** Phases 1–7 live, 1,000–5,000 orders/month, active CMS and analytics.

| Service | Monthly cost |
|---------|--------------|
| Vercel Pro + usage | $20 – $100 |
| Supabase Pro | $25 – $75 |
| PostHog | $0 – $100 |
| Sanity | $0 – $99 |
| Resend | $20 – $50 |
| GitHub | $0 – $20 |

**Estimated monthly total:** **$65 – $350/month** (excluding Stripe).

### 1.3 Scale

**Profile:** 10,000+ SKUs, heavy traffic, peak sale events.

**Estimated monthly total:** **$200 – $800+/month** (excluding Stripe).

Infrastructure remains a small fraction of revenue at healthy trading volumes.

---

## 2. Transaction Costs (Stripe)

Stripe has **no standard monthly platform fee** for e-commerce. Cost is **per successful payment**.

### 2.1 Typical Australia Online Card Pricing

| Item | Rate |
|------|------|
| Domestic cards | ~1.75% + $0.30 per transaction |
| International cards | Higher (varies) |
| Stripe Tax (Phase 6) | Additional per-transaction fee when enabled |
| Chargebacks | Separate fee if disputed |

*Confirm current rates on [stripe.com/au/pricing](https://stripe.com/au/pricing) at proposal time.*

### 2.2 Worked Examples

| Order value | Approx. Stripe fee |
|-------------|-------------------|
| $200 | ~$3.80 |
| $500 | ~$9.05 |
| $2,500 | ~$44.05 |

### 2.3 Annual Stripe Cost vs Revenue

| Annual online revenue | Approx. annual Stripe fees (~1.75% + $0.30)* |
|----------------------|-----------------------------------------------|
| $100,000 | ~$1,800 – $2,500 |
| $500,000 | ~$9,000 – $11,000 |
| $1,000,000 | ~$18,000 – $22,000 |

\*Assumes average order value ~$300–$800; fees vary with basket size and card mix.

---

## 3. Labour — Build Effort by Phase

Estimates for an experienced developer familiar with Next.js, Supabase, and Stripe. Hours include implementation, basic testing, and deployment — not extensive client workshops or content production.

| Phase | Deliverables | Hours (low – high) |
|-------|--------------|-------------------|
| **1 — Catalogue** | Product DB, browsing, search, public APIs, SEO, analytics foundation, CI | 100 – 160 |
| **2 — Payments** | Cart, Stripe checkout, webhooks, order records | 40 – 60 |
| **3 — CMS & CRM** | Sanity CMS, admin dashboard, product sync, analytics widgets | 60 – 90 |
| **4 — Accounts** | Customer login, order history, guest-to-account linking, security policies | 30 – 45 |
| **5 — Inventory** | Stock tracking, reservations, oversell prevention | 30 – 45 |
| **6 — Shipping & Tax** | Domestic shipping zones, Stripe Tax, fulfilment emails | 40 – 55 |
| **7 — Returns & Scale** | Returns/refunds, rate limiting, load testing, monitoring | 30 – 45 |
| **Setup & PM** | Accounts, environments, deploy pipeline, coordination | 15 – 25 |
| **Total (Phases 1–7)** | Full platform | **345 – 525** |
| **Total (Phases 1–2 only)** | MVP — browse and buy | **140 – 220** |

### 3.1 Labour Not Included in Above

| Activity | Typical effort |
|----------|----------------|
| Product photography | Client or specialist vendor |
| Product data entry (SKU, copy, images) | 20 – 80+ hours or per-SKU outsourcing |
| Brand/copywriting | Separate engagement |
| SEO agency retainer | Separate engagement |
| Paid advertising | Separate budget |
| Legal, accounting, GST setup | Separate professional fees |
| Ongoing maintenance | 4 – 12 hours/month after launch |

---

## 4. Labour Cost — Rate Card (AUD)

Apply rates to hours in Section 3.

| Resource type | Hourly rate (AUD) | Phases 1–2 build | Full platform (1–7) |
|---------------|-------------------|------------------|---------------------|
| Offshore freelancer | $60 – $90 | $8,400 – $19,800 | $20,700 – $47,250 |
| AU mid-level freelancer | $120 – $160 | $16,800 – $35,200 | $41,400 – $84,000 |
| AU agency | $150 – $220 | $21,000 – $48,400 | $51,750 – $115,500 |
| Senior boutique / principal | $180 – $250 | $25,200 – $55,000 | $62,100 – $131,250 |

### 4.1 Proposal Contingency

Add **10 – 20%** to labour for:

- Client review cycles and change requests
- UAT and bug-fix buffer
- Meetings and documentation
- Unexpected integration complexity

**Example:** $50,000 base build + 15% contingency = **$57,500** quoted fixed price.

---

## 5. Client Package Models

### Package A — MVP (Go Live & Sell)

**Phases included:** 1 + 2  
**Client can:** Browse catalogue, search products, complete purchases, receive order confirmation.

| Cost line | Low | High |
|-----------|-----|------|
| Build labour | $17,000 | $48,000 |
| Year 1 hosting & tools | $600 | $2,000 |
| Stripe (on $500k revenue) | ~$9,000 | ~$9,000 |
| **Year 1 total** | **~$27,000** | **~$59,000** |

**Deferred:** Self-service CMS, customer accounts, inventory automation, shipping/tax automation, returns portal.

---

### Package B — Full Business Platform

**Phases included:** 1 – 7  
**Client can:** Everything in Package A plus team-managed content, CRM, accounts, inventory, shipping/tax, returns, scale hardening.

| Cost line | Low | High |
|-----------|-----|------|
| Build labour | $41,000 | $115,000 |
| Year 1 hosting & tools | $1,500 | $5,000 |
| Stripe (on $500k revenue) | ~$9,000 | ~$9,000 |
| **Year 1 total** | **~$52,000** | **~$129,000** |

---

### Package C — Phased Engagement (Recommended)

Bill per phase; client funds next phase from revenue.

| Phase | Indicative build cost (mid AU freelancer @ $140/hr) |
|-------|-----------------------------------------------------|
| Phase 1 | $16,800 – $22,400 |
| Phase 2 | $6,300 – $8,400 |
| Phase 3 | $9,450 – $12,600 |
| Phase 4 | $4,725 – $6,300 |
| Phase 5 | $4,725 – $6,300 |
| Phase 6 | $6,300 – $7,700 |
| Phase 7 | $4,725 – $6,300 |
| **Cumulative** | **~$53,000 – $70,000** |

Allows trading to begin after **~$23,000 – $31,000** (Phases 1–2).

---

### Package D — Self-Build

| Cost line | Amount |
|-----------|--------|
| Cash outlay (SaaS year 1) | $500 – $3,000 |
| Owner/builder time | 350 – 525 hours |
| Stripe | % of sales only |

Lowest cash cost; highest opportunity cost. Suitable if builder has Next.js/Supabase capability or uses assisted development.

---

## 6. Ongoing Costs After Launch

| Item | Frequency | Indicative cost |
|------|-----------|-----------------|
| Hosting & database (Vercel + Supabase) | Monthly | $0 – $350 |
| Analytics (PostHog) | Monthly | $0 – $100 |
| CMS (Sanity) | Monthly | $0 – $99 |
| Email (Resend) | Monthly | $0 – $50 |
| Domain renewal | Annual | $15 – $50 |
| Maintenance & small fixes | Monthly | 4 – 12 hrs labour |
| Security/dependency updates | Quarterly | 2 – 8 hrs labour |
| Stripe | Per transaction | ~1.75% + $0.30 |

**Typical ongoing retainer (agency):** **$500 – $2,000/month** for light maintenance; more for active feature development.

---

## 7. Cost Reduction Levers

| Lever | Impact |
|-------|--------|
| Launch Phases 1–2 only; defer 3–7 | ~50–60% lower initial build cost |
| Use Vercel + Supabase free tiers at start | $0 – $50/month hosting |
| Client supplies product CSV and images | Saves 20 – 40 labour hours |
| Sanity free tier until content team grows | Defer CMS subscription |
| Owner-led build with technical support | Lower labour $; higher owner time |
| Skip load testing (Phase 7) until traffic warrants | Small Phase 7 saving |

---

## 8. Exclusions (State Clearly in Proposals)

The following are **not included** in build or running cost estimates above:

- Product photography, 3D renders, or lifestyle imagery
- Copywriting, brand design, or marketing campaigns
- Paid media (Google Ads, Meta, etc.)
- Accounting, legal, business registration, GST advice
- Warehouse, showroom, or fulfilment labour
- Custom ERP / Xero / MYOB integration (future scope)
- Mobile native app (future scope)
- International multi-currency (future scope)
- Stripe chargebacks and dispute fees
- Content translation or multi-language

---

## 9. Client-Facing Summary (Copy-Ready)

> **Monthly running costs** for the platform start around **$0–50** while the store is small. As you grow, expect **$65–350/month** for hosting, database, and tools — still modest compared to revenue.
>
> **Stripe** charges approximately **1.75% + 30c per sale**. There is no monthly payment fee; you only pay when you earn.
>
> **Building in phases** means you can **open for business after Phase 2** for roughly **$20,000–50,000** in development (depending on who builds it). Full operations — CMS, accounts, inventory, shipping, returns — typically lands at **$50,000–130,000** all-in for year one including build and tools.
>
> **You own the code and data.** You are not locked into a template platform with rising monthly fees and limited export options.

---

## 10. Assumptions & Revision Notes

| Assumption | Value |
|------------|-------|
| Market | Single country (Australia), one currency (AUD) |
| Catalogue scale target | Up to 10,000+ SKUs |
| Payment provider | Stripe |
| Database & auth | Supabase |
| Hosting | Vercel |
| CMS (when enabled) | Sanity |
| Analytics | PostHog + Vercel Analytics |

**Revision:** Update Stripe rates, SaaS pricing, and hourly rates when preparing a formal proposal. This document should be reviewed quarterly or before each client quote.

---

## Related Documentation

| Document | Link |
|----------|------|
| Client overview (non-technical) | [DavidEcomm-Client-Overview.md](./DavidEcomm-Client-Overview.md) |
| Infrastructure & phases | [Infrastructure & CI Design](./superpowers/specs/2026-07-18-davidecomm-infra-ci-design.md) |
| Phase 1 build plan | [Phase 1 Implementation Plan](./superpowers/plans/2026-07-18-phase-1-catalog.md) |

---

*Document prepared for DavidEcomm — July 2026*
