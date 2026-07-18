# DavidEcomm — Frontend Design Specification

**Date:** 2026-07-18  
**Status:** Draft — pending user review  
**Project:** DavidEcomm (greenfield e-commerce)  
**Reference:** BDK Supply mockups (layout and style reference only; DavidEcomm branding)  
**Related:** [Infrastructure & CI Design](./2026-07-18-davidecomm-infra-ci-design.md)

---

## 1. Overview

DavidEcomm is a premium fixtures e-commerce storefront built with **Next.js App Router**, **Tailwind CSS**, and **shadcn/ui**. The visual design follows the BDK Supply mockup layout — navy and gold palette, serif hero headlines, mega-menu navigation, and a content-rich homepage — applied to DavidEcomm branding and content.

### Goals

- Pixel-faithful implementation of the approved mockup layout and interaction patterns.
- Server-first rendering for catalog pages (ISR, SEO, LCP targets from infra spec).
- Three-pillar mega-menu navigation: Bathroom, Doors & Hardware, Kitchen & Laundry.
- Full homepage in Phase 1 (all 11 sections).
- Responsive design: desktop mega-menus, mobile sheet navigation.
- Component architecture that supports Sanity CMS content in Phase 3 without layout rewrites.

### Non-Goals

- BDK Supply branding, copy, or product data.
- On-site AI chat or shopping assistant.
- Custom design tool / Figma handoff (spec is the source of truth).
- Native mobile apps.

---

## 2. Architecture Decision: Server-First + Island Interactivity

**Selected over:**
- *Client-heavy SPA nav* — rejected; conflicts with LCP and SEO targets.
- *CMS block builder from day one* — rejected; CMS is Phase 3 per infra spec.

### Core Principles

1. **Server Components by default** — pages, product grids, metadata, footer.
2. **Client islands only where needed** — mega-menu, carousels, search overlay, cart drawer, newsletter form.
3. **Shared component library** — `ProductCard`, `ProductCarousel`, `SectionHeading` reused across homepage and PLP.
4. **Data-driven navigation** — category tree in Supabase Phase 1; Sanity-managed Phase 3.
5. **Design tokens in Tailwind config** — no magic hex values in components.

### Stack

| Concern | Technology |
|---------|------------|
| Framework | Next.js 15+ (App Router) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix primitives) |
| Carousels | embla-carousel-react (via shadcn Carousel) |
| Fonts | `next/font` — Playfair Display (display) + DM Sans (body) |
| Icons | Lucide React (UI) + custom SVG (category line-art) |
| Images | `next/image` with Vercel Image Optimization |

---

## 3. Design System

### 3.1 Color Palette

| Token | Hex | Tailwind key | Usage |
|-------|-----|--------------|-------|
| Navy 900 | `#0B172A` | `navy-900` | Nav bar, newsletter, footer |
| Navy 800 | `#1A2B42` | `navy-800` | Dark surface hover |
| Gold 500 | `#C19A6B` | `gold-500` | CTAs, badges, accents |
| Gold 600 | `#A8835A` | `gold-600` | CTA hover |
| Sale Red | `#A50000` | `sale-red` | Sale banner background |
| White | `#FFFFFF` | `white` | Page background, cards |
| Gray 50 | `#F8F9FA` | `gray-50` | Alternate sections, trust bar |
| Gray 200 | `#E5E7EB` | `gray-200` | Borders, icon outlines |
| Gray 600 | `#6B7280` | `gray-600` | Secondary body text |
| Gray 900 | `#111827` | `gray-900` | Headings, product titles |

Configure in `tailwind.config.ts` under `theme.extend.colors`.

### 3.2 Typography

| Role | Font | Weight | Size (desktop) | Usage |
|------|------|--------|----------------|-------|
| Display | Playfair Display | 400–600 | `text-4xl`–`text-5xl` | Hero headlines |
| Heading | DM Sans | 600–700 | `text-xl`–`text-2xl` | Section titles (uppercase) |
| Body | DM Sans | 400 | `text-base` | Descriptions, nav |
| Label | DM Sans | 500–600 | `text-sm` | Buttons, badges, prices |
| Caption | DM Sans | 400 | `text-xs` | Top bar, review counts |

**Rules:**
- Section headings: `uppercase tracking-wide font-semibold`.
- Hero headline: serif, sentence case.
- Product titles: `text-sm font-medium text-gray-900` (uppercase in mockup).
- Prices: `font-bold text-gray-900`.

### 3.3 Spacing & Layout

| Token | Value |
|-------|-------|
| Max content width | `1280px` (`max-w-7xl`) |
| Section padding | `py-12 lg:py-16` |
| Container padding | `px-4 sm:px-6 lg:px-8` |
| Grid gap (products) | `gap-4 lg:gap-6` |
| Button border radius | `rounded-sm` (2px) |
| Card border radius | `rounded-md` (6px) |

### 3.4 UI Patterns

- **CTA buttons:** Rectangular, gold background, white text, arrow suffix: `SHOP COLLECTION →`
- **Text links:** `text-gray-900 hover:text-gold-500` with `→` arrow
- **Product badges:** Top-left overlay — `BEST SELLER` (gold bg), `NEW` (navy bg), `SALE` (red bg)
- **Star ratings:** 5-star display + `(N)` review count in gray
- **Mega-menu thumbnails:** Circular (`rounded-full`), `w-20 h-20`, image + label below
- **Category icons:** Line-art SVG, `w-12 h-12`, centered in bordered square tile

---

## 4. Global Layout

### 4.1 Top Bar

```
┌─────────────────────────────────────────────────────────────┐
│  FREE SHIPPING AUSTRALIA WIDE*          📞 Phone │ Hours   │
└─────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `navy-900` |
| Text | `white text-xs` |
| Height | `36px` |
| Left | Promo message (CMS-editable Phase 3) |
| Right | Phone number + showroom/trading hours |

### 4.2 Header (two rows)

```
┌─────────────────────────────────────────────────────────────┐
│  [DavidEcomm Logo]   [━━━━━━ Search bar ━━━━━━]  🔍 👤 🛒  │
├─────────────────────────────────────────────────────────────┤
│       BATHROOM ▾  │  DOORS & HARDWARE ▾  │  KITCHEN & LAUNDRY ▾ │
└─────────────────────────────────────────────────────────────┘
```

**Row 1 — utility bar:**
- Logo: left, links to `/`
- Search: prominent centered input, placeholder "Search for products..."
- Icons right: Search (mobile overlay trigger), Account, Cart (badge count)

**Row 2 — navigation bar:**
- Background: `navy-900`
- Three pillar links only, white uppercase text, chevron down indicator
- Hover: opens mega-menu
- Sticky on scroll (both rows stick together)

### 4.3 Footer

Four-column layout desktop; stacked accordion mobile.

| Column 1 | Column 2 — Shop | Column 3 — Customer Care | Column 4 — Contact |
|----------|-----------------|--------------------------|-------------------|
| Logo | Bathroom | Shipping & Delivery | Phone (click-to-call) |
| About blurb (2 lines) | Doors & Hardware | Returns & Refunds | Email (mailto) |
| Social icons (FB, IG) | Kitchen & Laundry | FAQ | Showroom address |
| | Sale | Contact Us | Trading hours |

**Bottom bar:** Payment icons (Visa, Mastercard, PayPal, Stripe) · © DavidEcomm · Privacy · Terms

Background: `navy-900`, white/gray-400 text.

---

## 5. Navigation & Mega-Menu

### 5.1 Pillars (top-level only)

1. **Bathroom** — slug: `bathroom`
2. **Doors & Hardware** — slug: `doors-hardware`
3. **Kitchen & Laundry** — slug: `kitchen-laundry`

No other top-level nav items. Sale, Brands, Inspiration, Vanities, etc. live inside mega-menus or footer.

### 5.2 Mega-Menu Layout

```
┌────────────────────┬──────────────────────────────────────────┐
│  LEFT PANEL        │  RIGHT PANEL                             │
│  w-64, border-r    │  flex-1, p-6                           │
│                    │                                          │
│  All {Pillar}      │  Heading: {Selected sub-category}      │
│  › Vanities    ◀── │                                          │
│  › Tapware         │  (○ img)  (○ img)  (○ img)  (○ img)    │
│  › Toilets         │  Label    Label     Label    Label      │
│  › …               │                                          │
└────────────────────┴──────────────────────────────────────────┘
```

**Interaction (desktop):**
- Hover pillar → menu opens (full viewport width, white background, shadow)
- Hover/focus left item → right panel updates instantly (client state)
- First item in left list: "All {Pillar}" → links to pillar PLP
- Active left item: `font-semibold underline underline-offset-4`
- Click any link → navigate + close menu
- Click outside or Escape → close menu

**Interaction (mobile):**
- Hamburger → `Sheet` from left, full height
- Accordion: pillar → subcategories → links
- Search bar pinned at top of sheet

**shadcn components:** `NavigationMenu`, `NavigationMenuContent`, `NavigationMenuTrigger` (desktop); `Sheet`, `Accordion` (mobile)

### 5.3 Category Trees (seed data)

#### Bathroom

| Sub-category | Visual children (right panel) |
|--------------|-------------------------------|
| All Bathroom | — (links to `/categories/bathroom`) |
| Vanities | All Vanities, Wall Hung, Floor Standing, Double Basin |
| Tapware | Basin Mixers, Bath Mixers, Shower Mixers, Spouts |
| Toilets | All Toilets, Wall Faced, Back to Wall, In-Wall Cistern |
| Basins | All Basins, Above Counter, Under Counter, Vessel |
| Showers | Shower Heads, Arms & Rails, Shower Systems, Shower Screens |
| Baths & Spas | Freestanding, Built-In, Spa Baths |
| Mirrors & Cabinets | LED Mirrors, Shaving Cabinets, Mirror Cabinets |
| Accessories | Towel Rails, Toilet Roll Holders, Soap Dispensers |
| Waste & Drains | Floor Wastes, Basin Wastes, Grates |

#### Doors & Hardware

| Sub-category | Visual children (right panel) |
|--------------|-------------------------------|
| All Doors & Hardware | — |
| Door Handles | All Handles, Lever Handles, Knob Handles, Pull Handles |
| Locks & Latches | Entrance Locks, Privacy Sets, Deadbolts |
| Hinges | Butt Hinges, Concealed Hinges, Pivot Hinges |
| Door Closers | Surface Mounted, Concealed |
| Sliding Door Hardware | Barn Door, Pocket Door |
| Cabinet Hardware | Knobs, Pulls, Catches |
| Window Hardware | Window Handles, Locks, Stay Arms |

#### Kitchen & Laundry

| Sub-category | Visual children (right panel) |
|--------------|-------------------------------|
| All Kitchen & Laundry | — |
| Kitchen Sinks | All Sinks, Undermount, Topmount, Butler Sinks |
| Kitchen Tapware | Sink Mixers, Filter Taps, Pot Fillers |
| Laundry Tubs | Single Tub, Double Tub, Cabinet Tubs |
| Cabinet Handles | Bar Handles, Knobs, Cup Pulls |
| Splashbacks | Glass, Acrylic |
| Kitchen Accessories | Sink Grids, Colanders, Dispensers |

### 5.4 Search

| Feature | Implementation |
|---------|----------------|
| Desktop | Inline search bar in header row 1 |
| Mobile | Search icon opens full-screen `Dialog` with input |
| Submit | Navigate to `/search?q={query}` |
| Autocomplete (Phase 1) | None — full results page only |
| Autocomplete (Phase 3) | Debounced dropdown, top 5 products + categories |
| Analytics | `product_click` with `source: "search"` |

### 5.5 Utility Icons

| Icon | Phase 1 | Phase 2 | Phase 4 |
|------|---------|---------|---------|
| Account | `/account` stub page | Same | Login/account dropdown |
| Cart | `/cart` stub (empty state) | Functional cart + badge | Same |

---

## 6. Homepage Sections

All sections ship in Phase 1. Data from Supabase seed tables; CMS-editable in Phase 3.

### Section map

| # | Section | Component | Height / layout |
|---|---------|-----------|-----------------|
| 1 | Hero carousel | `HeroCarousel` | `min-h-[500px]` desktop |
| 2 | Featured products | `ProductCarousel` | 4-col carousel |
| 3 | Shop by collection | `CollectionCards` | 3-col grid |
| 4 | Shop by category | `CategoryIconGrid` | 10 icon tiles |
| 5 | Sale banner | `PromoBanner` | Full-width red |
| 6 | Best sellers | `ProductCarousel` | 4-col carousel |
| 7 | New arrivals | `ProductCarousel` | 4-col carousel |
| 8 | Inspiration gallery | `InspirationGrid` | 4-col image grid |
| 9 | Trust bar | `TrustBar` | 4 items horizontal |
| 10 | Newsletter | `NewsletterSignup` | Full-width navy |
| 11 | Footer | `SiteFooter` | 4-col + bottom bar |

### 6.1 Hero Carousel

- Full-bleed lifestyle image with `bg-black/40` overlay
- Content: bottom-left or center-left aligned
  - Serif headline (e.g. "The Hidden Gem You've Been Looking For")
  - Sans subheadline (e.g. "Premium fixtures. Honest prices.")
  - Gold CTA button → configurable link
- Controls: prev/next arrows, dot indicators
- Multiple slides from `homepage_heroes` table
- First slide image: `priority` for LCP

### 6.2 Featured Products

- Header row: left — section title + subtitle; right — `VIEW COLLECTION →` link
- `ProductCarousel` with products where `featured = true`
- Default title: "FEATURED PRODUCTS"

### 6.3 Shop by Collection

- Three equal cards in a row
- Each card: full-height image, white text box overlay at bottom
  - Collection name (e.g. PREMIUM COLLECTION)
  - Short description (2 lines)
  - `SHOP PREMIUM →` link
- Default collections: Premium, Best Value, Essential
- Links: `/collections/premium`, `/collections/best-value`, `/collections/essential`

### 6.4 Shop by Category

- Section title: "SHOP BY CATEGORY"
- 10 tiles in a horizontal row (scroll on mobile)
- Each tile: bordered square, line-art SVG icon, label below
- Links to top sub-categories across all pillars
- Default icons: Vanities, Toilets, Basins, Tapware, Baths, Showers, Mirrors, Accessories, Laundry, Cabinets

### 6.5 Sale Banner

- Background: `sale-red` with subtle gradient
- Left content:
  - Pill badge: "LIMITED TIME ONLY"
  - Large headline: "ON SALE"
  - Subtext: promotional copy
  - White CTA: `SHOP THE SALE →`
- Right: product image (vanity/product shot)
- Optional carousel for multiple promos
- Data: `homepage_promos` table

### 6.6 Best Sellers

- Same layout as Featured Products
- Query: products with `badge = 'best_seller'`, limit 4
- Title: "BEST SELLERS"
- Link: `VIEW ALL →` → `/collections/best-sellers`

### 6.7 New Arrivals

- Same layout as Featured Products
- Query: `ORDER BY created_at DESC`, limit 4
- Title: "NEW ARRIVALS"
- Products display `NEW` badge

### 6.8 Inspiration Gallery

- Title: "BATHROOM INSPIRATION" (or generic "INSPIRATION")
- `VIEW GALLERY →` → `/inspiration`
- 4 lifestyle images in a grid
- Hover: `scale-105` transform, `transition-transform duration-300`
- Data: `inspiration_images` table
- `/inspiration` page: full masonry/grid gallery (Phase 1 stub with seeded images)

### 6.9 Trust Bar

Four items only (showroom icon excluded per design review):

1. 🚚 Free Shipping Australia Wide
2. ✓ Premium Quality Products
3. 🛡 Up to 15 Year Warranty
4. 💬 Expert Advice & Support

Layout: `bg-gray-50`, 4 equal columns desktop, 2×2 grid mobile. Icon + label centered.

### 6.10 Newsletter

- `bg-navy-900`, white text
- Left: "Be the First to Know" + "Get the latest products, inspiration and exclusive offers."
- Right: email `Input` + gold `SUBSCRIBE →` button
- Phase 1: client-side validation, success/error toast, no backend persistence
- Phase 3: persist to Supabase `newsletter_subscribers`, sync to email provider

### 6.11 Footer

See Section 4.3. Footer menu links and contact details are priority items (called out in design review).

---

## 7. Page Templates

### 7.1 Product Listing Page (PLP) — `/categories/[slug]`

**Layout:**
```
Breadcrumb: Home > Bathroom > Vanities

┌──────────┬────────────────────────────────────┐
│ Filters  │  Sort: [Featured ▾]   24 products  │
│          │  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│ Category │  │    │ │    │ │    │ │    │      │
│ Price    │  └────┘ └────┘ └────┘ └────┘      │
│ In stock │  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│          │  │    │ │    │ │    │ │    │      │
│          │  └────┘ └────┘ └────┘ └────┘      │
│          │  [ Load more ]                      │
└──────────┴────────────────────────────────────┘
```

| Feature | Detail |
|---------|--------|
| Grid | 4-col desktop, 2-col mobile |
| Filters | Sidebar desktop; `Sheet` with "Filter" button mobile |
| Sort | Featured, Price Low–High, Price High–Low, Newest |
| Pagination | Cursor-based (load more button) |
| Rendering | ISR, revalidate 60s |
| Empty state | "No products found" + suggested categories |

### 7.2 Collection Page — `/collections/[slug]`

Same as PLP but pre-filtered by collection tag (premium, best-value, essential, best-sellers, sale).
Includes collection hero banner with title and description.

### 7.3 Product Detail Page (PDP) — `/products/[slug]`

**Layout:**
```
Breadcrumb: Home > Bathroom > Vanities > Avila 1500 Fluted Oak

┌────────────────────┬──────────────────────────┐
│  Image gallery     │  Product name            │
│  [main image]      │  ★★★★★ (47)             │
│  [thumb][thumb]    │  $2,450.00               │
│                    │  SKU: DAV-1500-FO         │
│                    │  [Variant selectors]     │
│                    │  [ ADD TO CART ]         │
│                    │  [♡ Wishlist] (Phase 4)  │
└────────────────────┴──────────────────────────┘

[Tabs: Description | Specifications | Reviews]

Related Products carousel
```

| Feature | Detail |
|---------|--------|
| Gallery | Main image + thumbnail strip; click thumb to swap |
| Variants | Attribute selectors (size, color, finish) if `attributes` jsonb populated |
| Add to cart | Gold full-width button; disabled with "Out of stock" when `in_stock = false` (Phase 5) |
| Reviews | Stub Phase 1 ("Reviews coming soon"); real reviews deferred |
| Related | Same-category products carousel, limit 4 |
| SEO | `generateMetadata()` + JSON-LD `Product` schema |
| Rendering | ISR, revalidate 300s, on-demand via CMS webhook |

### 7.4 Search Results — `/search`

- Pre-filled search input in header
- Results count: "Showing N results for '{query}'"
- Product grid (same as PLP)
- No results: illustration + "Try searching for..." category links

### 7.5 Cart — `/cart` (Phase 2)

- Line items: thumbnail, name, SKU, qty stepper, line price, remove button
- Summary sidebar (sticky desktop): subtotal, shipping estimate, total
- `PROCEED TO CHECKOUT →` gold CTA
- `CONTINUE SHOPPING →` text link
- Empty state: illustration + CTA to homepage

### 7.6 Checkout — `/checkout` (Phase 2)

- Two-column layout desktop; stacked mobile
- Left: shipping form (email, name, address) + Stripe Payment Element
- Right: order summary (sticky)
- Gold `PLACE ORDER →` submit button
- DavidEcomm branding throughout; no Stripe branding beyond Payment Element

### 7.7 Account — `/account` (Phase 4)

- Tabs: Orders, Profile, Addresses
- Order history: date, status, total, view detail link
- Login/register pages: centered card on `gray-50` background

### 7.8 Static Pages — `/inspiration`, `/sale`, `/contact`

- **Inspiration:** full image gallery grid
- **Sale:** PLP pre-filtered to sale products
- **Contact:** phone, email, address, contact form (Phase 3)

---

## 8. Shared Components

### 8.1 Component Catalog

| Component | Server/Client | Props / notes |
|-----------|---------------|---------------|
| `SiteHeader` | Server shell | Wraps `TopBar`, `HeaderSearch`, `MegaMenu` |
| `TopBar` | Server | Promo text, phone, hours |
| `MegaMenu` | Client | Pillar tree data, hover state |
| `HeaderSearch` | Client | Inline input + mobile dialog |
| `SiteFooter` | Server | Link columns, contact, payment icons |
| `ProductCard` | Server | `product`, optional `badge` |
| `ProductCarousel` | Client | `products[]`, `title`, `viewAllHref` |
| `ProductGrid` | Server | `products[]`, responsive columns |
| `ProductGallery` | Client | `images[]`, selected index state |
| `CollectionCards` | Server | `collections[]` |
| `CategoryIconGrid` | Server | `categories[]` with icon keys |
| `HeroCarousel` | Client | `slides[]` |
| `PromoBanner` | Server | `promo` data |
| `InspirationGrid` | Server | `images[]` |
| `TrustBar` | Server | Static items array |
| `NewsletterSignup` | Client | Form state, validation |
| `Breadcrumbs` | Server | `items[]` |
| `PriceDisplay` | Server | `cents`, `currency` |
| `StarRating` | Server | `rating`, `count` |
| `Badge` | Server | `variant`: best-seller, new, sale |
| `SectionHeading` | Server | `title`, `subtitle?`, `href?` |
| `AddToCartButton` | Client | Phase 2; cart context |
| `CartDrawer` | Client | Optional slide-out; or `/cart` page only Phase 2 |

### 8.2 ProductCard Specification

```
┌─────────────────────┐
│ [BEST SELLER]       │  ← badge overlay, top-left
│                     │
│    product image    │  ← aspect-square, object-cover
│                     │
├─────────────────────┤
│ PRODUCT NAME        │  ← uppercase, text-sm, 2-line clamp
│ $2,450.00           │  ← bold
│ ★★★★★ (47)          │  ← stars + count
└─────────────────────┘
```

- Entire card is a link to PDP
- Hover: subtle shadow lift (`hover:shadow-md transition-shadow`)
- Analytics: `product_impression` on viewport entry, `product_click` on click

### 8.3 File Structure

```
app/
  (storefront)/
    layout.tsx
    page.tsx                          # Homepage
    products/[slug]/page.tsx
    categories/[slug]/page.tsx
    collections/[slug]/page.tsx
    search/page.tsx
    inspiration/page.tsx
    sale/page.tsx
    cart/page.tsx                     # Phase 2
    checkout/page.tsx                 # Phase 2
    account/page.tsx                  # Phase 4
    login/page.tsx                    # Phase 4
  api/
    newsletter/route.ts               # Phase 1 stub
components/
  layout/
    site-header.tsx
    top-bar.tsx
    mega-menu.tsx
    header-search.tsx
    site-footer.tsx
    breadcrumbs.tsx
  homepage/
    hero-carousel.tsx
    collection-cards.tsx
    category-icon-grid.tsx
    promo-banner.tsx
    inspiration-grid.tsx
    trust-bar.tsx
    newsletter-signup.tsx
  product/
    product-card.tsx
    product-carousel.tsx
    product-grid.tsx
    product-gallery.tsx
    add-to-cart-button.tsx
    price-display.tsx
    star-rating.tsx
    badge.tsx
  ui/                                 # shadcn primitives
lib/
  navigation.ts
  homepage.ts
  products.ts
  fonts.ts
public/
  icons/categories/                   # SVG line-art icons
  llms.txt
```

---

## 9. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| `sm` | 640px | 2-col product grid |
| `md` | 768px | Footer 2-col |
| `lg` | 1024px | Mega-menu desktop; 4-col grid; sidebar filters |
| `xl` | 1280px | Max container width |
| `< lg` | — | Hamburger nav; filter sheet; 2-col grids |

### Mobile-specific

- Sticky header (top bar collapses on scroll down, reappears on scroll up)
- Product carousels: swipeable, 1.5 cards visible (peek next)
- Mega-menu → full-screen sheet with accordion
- Trust bar: 2×2 grid
- Footer: accordion sections

---

## 10. Data Model Extensions (Frontend)

Extends [infra spec data model](./2026-07-18-davidecomm-infra-ci-design.md#5-data-model).

### Homepage tables (Phase 1)

```sql
-- homepage_heroes
id, headline, subheadline, cta_text, cta_href, image_url, sort_order, active

-- homepage_promos
id, eyebrow, headline, subtext, cta_text, cta_href, image_url, active

-- homepage_collections
id, name, slug, description, image_url, cta_text, sort_order

-- inspiration_images
id, image_url, alt_text, sort_order, active

-- footer_links
id, column, label, href, sort_order

-- site_config (singleton)
promo_text, phone, email, address, trading_hours, social_links jsonb
```

### Category extensions

```sql
-- categories (additive)
nav_pillar         text    -- 'bathroom' | 'doors-hardware' | 'kitchen-laundry'
icon_key           text    -- maps to SVG in public/icons/categories/
mega_menu_image    text
mega_menu_order    integer
show_in_mega_menu  boolean DEFAULT true

-- products (additive)
featured           boolean DEFAULT false
badge              text    -- 'best_seller' | 'new' | 'sale' | null
collection_slugs   text[]  -- ['premium', 'best-value', 'sale']
rating             numeric(2,1) DEFAULT 0
review_count       integer DEFAULT 0
```

---

## 11. Accessibility

- All interactive elements keyboard-navigable
- Mega-menu: `aria-expanded`, `aria-haspopup`, focus trap in mobile sheet
- Skip to content link (visually hidden, visible on focus)
- Color contrast: gold on white meets WCAG AA for large text; navy on white for body
- Images: required `alt_text` (enforced in CMS Phase 3, validated in seed data Phase 1)
- Form inputs: associated `<label>` elements, error messages linked via `aria-describedby`
- Carousels: prev/next buttons with `aria-label`, pause on hover

---

## 12. Performance Requirements

Aligned with infra spec targets.

| Requirement | Implementation |
|-------------|----------------|
| LCP < 2.5s | Hero `priority` image; ISR for homepage |
| CLS < 0.1 | Explicit image dimensions; `next/font` |
| Minimal JS | Server Components for 80%+ of homepage |
| Carousel JS | Loaded only on pages with carousels (`dynamic import`) |
| Third-party | PostHog `afterInteractive`; Stripe only on checkout |
| Images | `next/image`, WebP/AVIF, `sizes` attribute per breakpoint |

---

## 13. Phase Mapping

| Infra phase | Frontend deliverables |
|-------------|----------------------|
| **Phase 1** | Full homepage, mega-menu, PLP, PDP, search, inspiration, footer, newsletter stub |
| **Phase 2** | Cart page, checkout page, add-to-cart button, cart badge |
| **Phase 3** | CMS-driven homepage content, footer links, promo bar, blog/inspiration from Sanity |
| **Phase 4** | Login, register, account pages, wishlist (optional) |
| **Phase 5** | Out-of-stock UI, stock badge on PDP, disable add-to-cart |
| **Phase 6** | Shipping method selector at checkout, order confirmation email template |
| **Phase 7** | Returns request UI in account |

---

## 14. Open Questions (Resolved)

| Question | Decision |
|----------|----------|
| Brand | DavidEcomm; BDK mockups as layout reference |
| Top navigation | 3 pillars only (Bathroom, Doors & Hardware, Kitchen & Laundry) |
| Homepage scope Phase 1 | Full mockup (all 11 sections) |
| Styling | Tailwind CSS + shadcn/ui |
| Architecture | Server-first + client islands |
| Trust bar | 4 items; no showroom icon |
| Footer priority | Full menu columns + phone/email contact |
| Search | Prominent in header |

---

## 15. Success Criteria

- [ ] Homepage matches mockup layout across desktop and mobile viewports.
- [ ] Three-pillar mega-menu works with left/right panel interaction on desktop.
- [ ] Mobile navigation uses sheet + accordion; search accessible.
- [ ] All 11 homepage sections render with seeded data.
- [ ] PLP and PDP render from Supabase with ISR.
- [ ] ProductCard, carousels, and footer reused consistently.
- [ ] Lighthouse performance ≥ 90 on homepage and PDP.
- [ ] All pages pass axe accessibility audit (no critical violations).
- [ ] Footer displays shop links, customer care links, phone, and email.
