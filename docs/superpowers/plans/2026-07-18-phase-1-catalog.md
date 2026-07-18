# Phase 1 — Catalog & Storefront Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the DavidEcomm Phase 1 storefront — full homepage, three-pillar mega-menu, product catalog (PLP/PDP/search), Supabase-backed data, analytics/SEO/AI foundations, and CI gates.

**Architecture:** Next.js 15 App Router with Server Components for catalog pages (ISR), client islands for mega-menu and carousels, Supabase Postgres as product source of truth, typed data access in `lib/`, cross-cutting concerns in `lib/analytics`, `lib/seo`, and `app/api/v1`.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase JS v2, PostHog, Vitest, Playwright, GitHub Actions

**Specs:**
- [Infrastructure & CI](../specs/2026-07-18-davidecomm-infra-ci-design.md)
- [Frontend Design](../specs/2026-07-18-davidecomm-frontend-design.md)

## Global Constraints

- Next.js 15+ App Router; Server Components by default
- Tailwind CSS v4 + shadcn/ui (Radix base)
- Fonts: Playfair Display (display) + DM Sans (body) via `next/font`
- Colors: `navy-900` `#0B172A`, `gold-500` `#C19A6B`, `sale-red` `#A50000`
- ISR revalidate: home `60`, category `60`, product `300`
- Performance: LCP < 2.5s mobile p75; Lighthouse performance ≥ 90; main JS < 150kb gzipped
- Navigation: 3 pillars only — Bathroom, Doors & Hardware, Kitchen & Laundry
- Feature flags (env): `ENABLE_CHECKOUT=false`, `ENABLE_ADMIN=false`, `ENABLE_AUTH=false`
- Analytics: `ANALYTICS_ENABLED=false` in local dev and CI
- Market: single country (Australia), prices in AUD cents
- All product images via `next/image`; no raw `<img>` tags
- All analytics via `lib/analytics/track.ts`; no direct PostHog in components

---

## File Structure (Phase 1 deliverable)

```
davidecomm/
├── app/
│   ├── (storefront)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── products/[slug]/page.tsx
│   │   ├── categories/[slug]/page.tsx
│   │   ├── collections/[slug]/page.tsx
│   │   ├── search/page.tsx
│   │   ├── inspiration/page.tsx
│   │   ├── sale/page.tsx
│   │   ├── cart/page.tsx          # stub
│   │   └── account/page.tsx       # stub
│   ├── api/
│   │   ├── newsletter/route.ts
│   │   ├── feeds/products.json/route.ts
│   │   └── v1/
│   │       ├── products/route.ts
│   │       ├── products/[slug]/route.ts
│   │       ├── categories/route.ts
│   │       ├── search/route.ts
│   │       └── openapi.json/route.ts
│   ├── sitemap.ts
│   ├── robots.ts
│   └── layout.tsx
├── components/
│   ├── layout/        # site-header, mega-menu, site-footer, ...
│   ├── homepage/      # hero-carousel, product-carousel, ...
│   ├── product/       # product-card, product-grid, ...
│   └── ui/            # shadcn
├── lib/
│   ├── supabase/      # client, server, types
│   ├── analytics/     # track.ts, events.ts, provider.tsx
│   ├── seo/           # json-ld.ts, metadata.ts
│   ├── products.ts
│   ├── categories.ts
│   ├── navigation.ts
│   ├── homepage.ts
│   └── fonts.ts
├── supabase/
│   ├── migrations/001_phase1_schema.sql
│   └── seed.sql
├── public/
│   ├── llms.txt
│   └── icons/categories/
├── tests/
│   ├── unit/
│   └── e2e/smoke-catalog.spec.ts
├── .github/workflows/ci.yml
└── package.json
```

---

### Task 1: Next.js Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `.env.example`, `.gitignore`

**Interfaces:**
- Produces: runnable `npm run dev` on port 3000

- [ ] **Step 1: Create Next.js app**

```bash
cd /workspace
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm --turbopack
```

When prompted about existing files (README.md), allow merge/overwrite of defaults only where safe; preserve `docs/`.

- [ ] **Step 2: Add dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr posthog-js zod embla-carousel-react embla-carousel-autoplay
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @playwright/test
```

- [ ] **Step 3: Configure `next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 4: Add scripts to `package.json`**

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 5: Create `.env.example`**

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ANALYTICS_ENABLED=false
ENABLE_CHECKOUT=false
ENABLE_ADMIN=false
ENABLE_AUTH=false
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: Server starts without errors at `http://localhost:3000`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 project with dependencies"
```

---

### Task 2: Design System — Tailwind Tokens, Fonts, shadcn

**Files:**
- Create: `lib/fonts.ts`, `app/globals.css` (modify)
- Modify: `tailwind.config.ts`
- Create: `components.json` (via shadcn init)

**Interfaces:**
- Produces: `fontDisplay`, `fontSans` from `lib/fonts.ts`; shadcn `components/ui/*` primitives

- [ ] **Step 1: Initialize shadcn**

```bash
npx shadcn@latest init -d --base radix
npx shadcn@latest add button input navigation-menu sheet accordion dialog carousel badge separator
```

- [ ] **Step 2: Create `lib/fonts.ts`**

```typescript
import { DM_Sans, Playfair_Display } from "next/font/google";

export const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const fontDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
```

- [ ] **Step 3: Extend `tailwind.config.ts` colors**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 800: "#1A2B42", 900: "#0B172A" },
        gold: { 500: "#C19A6B", 600: "#A8835A" },
        sale: { red: "#A50000" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      maxWidth: {
        site: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Apply fonts in `app/layout.tsx`**

```typescript
import { fontSans, fontDisplay } from "@/lib/fonts";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body className="font-sans antialiased text-gray-900 bg-white">{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/fonts.ts tailwind.config.ts app/layout.tsx app/globals.css components.json components/ui
git commit -m "feat: add design tokens, fonts, and shadcn primitives"
```

---

### Task 3: Supabase Schema Migration

**Files:**
- Create: `supabase/migrations/001_phase1_schema.sql`

**Interfaces:**
- Produces: tables `categories`, `products`, `product_images`, `homepage_*`, `footer_links`, `site_config`, `url_redirects`, `api_keys`

- [ ] **Step 1: Write migration SQL**

Create `supabase/migrations/001_phase1_schema.sql` with:

```sql
-- categories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES categories(id),
  nav_pillar text CHECK (nav_pillar IN ('bathroom', 'doors-hardware', 'kitchen-laundry')),
  icon_key text,
  mega_menu_image text,
  mega_menu_order integer DEFAULT 0,
  show_in_mega_menu boolean DEFAULT true,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now()
);

-- products
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price integer NOT NULL,
  category_id uuid REFERENCES categories(id),
  sku text UNIQUE NOT NULL,
  gtin text,
  brand text,
  attributes jsonb DEFAULT '{}',
  meta_title text,
  meta_description text,
  og_image_url text,
  stock_quantity integer DEFAULT 0,
  in_stock boolean DEFAULT true,
  active boolean DEFAULT true,
  featured boolean DEFAULT false,
  badge text CHECK (badge IN ('best_seller', 'new', 'sale')),
  collection_slugs text[] DEFAULT '{}',
  rating numeric(2,1) DEFAULT 0,
  review_count integer DEFAULT 0,
  search_vector tsvector,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX products_slug_idx ON products(slug);
CREATE INDEX products_category_active_idx ON products(category_id, active);
CREATE INDEX products_active_updated_idx ON products(active, updated_at DESC);
CREATE INDEX products_search_idx ON products USING gin(search_vector);

-- product_images
CREATE TABLE product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text NOT NULL,
  sort_order integer DEFAULT 0
);

-- homepage tables
CREATE TABLE homepage_heroes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline text NOT NULL,
  subheadline text,
  cta_text text,
  cta_href text,
  image_url text NOT NULL,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true
);

CREATE TABLE homepage_promos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow text,
  headline text NOT NULL,
  subtext text,
  cta_text text,
  cta_href text,
  image_url text,
  active boolean DEFAULT true
);

CREATE TABLE homepage_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text NOT NULL,
  cta_text text DEFAULT 'SHOP COLLECTION →',
  sort_order integer DEFAULT 0
);

CREATE TABLE inspiration_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  alt_text text NOT NULL,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true
);

CREATE TABLE footer_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  column_name text NOT NULL,
  label text NOT NULL,
  href text NOT NULL,
  sort_order integer DEFAULT 0
);

CREATE TABLE site_config (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  promo_text text DEFAULT 'FREE SHIPPING AUSTRALIA WIDE*',
  phone text,
  email text,
  address text,
  trading_hours text,
  social_links jsonb DEFAULT '{}'
);

CREATE TABLE url_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path text UNIQUE NOT NULL,
  to_path text NOT NULL,
  status_code integer DEFAULT 301,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash text NOT NULL,
  name text NOT NULL,
  rate_limit integer DEFAULT 100,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- search vector trigger
CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.name,'') || ' ' || coalesce(NEW.description,''));
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_vector_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION products_search_vector_update();

-- RLS: public read on catalog
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (active = true);
CREATE POLICY "Public read product_images" ON product_images FOR SELECT USING (true);
```

- [ ] **Step 2: Apply migration to Supabase**

Run via Supabase SQL editor or CLI:

```bash
npx supabase db push   # if using local supabase CLI linked to project
```

Or paste `001_phase1_schema.sql` into Supabase Dashboard → SQL Editor → Run.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/001_phase1_schema.sql
git commit -m "feat: add Phase 1 Supabase schema migration"
```

---

### Task 4: Supabase Client & TypeScript Types

**Files:**
- Create: `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/types.ts`

**Interfaces:**
- Produces: `createClient()` (server), `createBrowserClient()` (client)
- Produces types: `Product`, `Category`, `ProductImage`, `HomepageHero`, etc.

- [ ] **Step 1: Write failing type test**

Create `tests/unit/types.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import type { Product } from "@/lib/supabase/types";

describe("Product type", () => {
  it("requires slug and price_cents fields", () => {
    const product: Product = {
      id: "1",
      name: "Test Vanity",
      slug: "test-vanity",
      price: 245000,
      sku: "DAV-001",
      active: true,
      in_stock: true,
      featured: false,
      rating: 4.5,
      review_count: 10,
      collection_slugs: [],
      attributes: {},
    };
    expect(product.slug).toBe("test-vanity");
  });
});
```

- [ ] **Step 2: Run test (expect fail)**

```bash
npm run test
```

Expected: FAIL — cannot find module `@/lib/supabase/types`

- [ ] **Step 3: Create `lib/supabase/types.ts`**

```typescript
export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  nav_pillar: "bathroom" | "doors-hardware" | "kitchen-laundry" | null;
  icon_key: string | null;
  mega_menu_image: string | null;
  mega_menu_order: number;
  show_in_mega_menu: boolean;
  meta_title: string | null;
  meta_description: string | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  category_id?: string | null;
  sku: string;
  gtin?: string | null;
  brand?: string | null;
  attributes: Record<string, string>;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image_url?: string | null;
  in_stock: boolean;
  active: boolean;
  featured: boolean;
  badge?: "best_seller" | "new" | "sale" | null;
  collection_slugs: string[];
  rating: number;
  review_count: number;
  product_images?: ProductImage[];
  categories?: Category | null;
}

export interface HomepageHero {
  id: string;
  headline: string;
  subheadline: string | null;
  cta_text: string | null;
  cta_href: string | null;
  image_url: string;
  sort_order: number;
}

export interface SiteConfig {
  promo_text: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  trading_hours: string | null;
  social_links: Record<string, string>;
}
```

- [ ] **Step 4: Create `lib/supabase/server.ts`**

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

- [ ] **Step 5: Run test**

```bash
npm run test
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/supabase tests/unit/types.test.ts vitest.config.ts
git commit -m "feat: add Supabase clients and catalog TypeScript types"
```

Add `vitest.config.ts` if not present:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: { environment: "jsdom" },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

---

### Task 5: Seed Data

**Files:**
- Create: `supabase/seed.sql`, `lib/products.ts`, `lib/categories.ts`, `lib/navigation.ts`

**Interfaces:**
- Produces: `getProducts()`, `getProductBySlug(slug)`, `getCategories()`, `getNavigationTree()`

- [ ] **Step 1: Write `supabase/seed.sql`**

Seed at minimum:
- 1 `site_config` row (phone, email, address, trading hours)
- 3 pillar categories + 10+ subcategories per frontend spec
- 20 products (4 featured, 4 best_seller, 4 new, 4 sale, remainder general)
- 2 `homepage_heroes`, 1 `homepage_promos`, 3 `homepage_collections`
- 8 `inspiration_images`, 12 `footer_links`
- Product images using `https://images.unsplash.com/...` URLs

- [ ] **Step 2: Create `lib/products.ts`**

```typescript
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/supabase/types";

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*), categories(*)")
    .eq("slug", slug)
    .eq("active", true)
    .single();
  if (error || !data) return null;
  return data as Product;
}

export const getCachedProductBySlug = (slug: string) =>
  unstable_cache(() => getProductBySlug(slug), [`product-${slug}`], {
    tags: [`product-${slug}`],
    revalidate: 300,
  })();

export async function getProducts(filters: {
  featured?: boolean;
  badge?: string;
  collection?: string;
  categorySlug?: string;
  limit?: number;
  cursor?: string;
}): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (filters.featured) query = query.eq("featured", true);
  if (filters.badge) query = query.eq("badge", filters.badge);
  if (filters.collection) query = query.contains("collection_slugs", [filters.collection]);
  if (filters.limit) query = query.limit(filters.limit);

  const { data } = await query;
  return (data ?? []) as Product[];
}
```

- [ ] **Step 3: Create `lib/navigation.ts`**

```typescript
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/supabase/types";

export interface NavPillar {
  slug: string;
  label: string;
  children: Category[];
}

export async function getNavigationTree(): Promise<NavPillar[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("mega_menu_order");
  const categories = (data ?? []) as Category[];

  const pillars: NavPillar[] = [
    { slug: "bathroom", label: "Bathroom", children: [] },
    { slug: "doors-hardware", label: "Doors & Hardware", children: [] },
    { slug: "kitchen-laundry", label: "Kitchen & Laundry", children: [] },
  ];

  for (const cat of categories) {
    const pillar = pillars.find((p) => p.slug === cat.nav_pillar);
    if (pillar && cat.show_in_mega_menu) pillar.children.push(cat);
  }
  return pillars;
}
```

- [ ] **Step 4: Run seed in Supabase SQL editor**

- [ ] **Step 5: Commit**

```bash
git add supabase/seed.sql lib/products.ts lib/categories.ts lib/navigation.ts
git commit -m "feat: add seed data and catalog data access layer"
```

---

### Task 6: Layout Components — Header, Footer, Mega-Menu

**Files:**
- Create: `components/layout/top-bar.tsx`, `site-header.tsx`, `mega-menu.tsx`, `header-search.tsx`, `site-footer.tsx`, `breadcrumbs.tsx`
- Create: `app/(storefront)/layout.tsx`

**Interfaces:**
- Consumes: `getNavigationTree()`, `SiteConfig` from Supabase
- Produces: `<SiteHeader />`, `<SiteFooter />` used in storefront layout

- [ ] **Step 1: Create `components/layout/top-bar.tsx`**

Server component; fetches `site_config`; renders promo left, phone + hours right on `bg-navy-900 text-white text-xs`.

- [ ] **Step 2: Create `components/layout/mega-menu.tsx`** (`"use client"`)

Uses shadcn `NavigationMenu`. Left panel: pillar children links. Right panel: circular thumbnails from `mega_menu_image`. Mobile: not rendered here (handled in sheet).

- [ ] **Step 3: Create `components/layout/header-search.tsx`** (`"use client"`)

Desktop: inline `Input` submits to `/search?q=`. Mobile: `Dialog` full-screen search.

- [ ] **Step 4: Create `components/layout/site-header.tsx`**

Two rows per frontend spec. Row 1: Logo (`DavidEcomm` text placeholder), `HeaderSearch`, icons (Search mobile, User → `/account`, Cart → `/cart` with badge `0`). Row 2: `MegaMenu` on `bg-navy-900`.

- [ ] **Step 5: Create `components/layout/site-footer.tsx`**

4-column footer per frontend spec Section 4.3. Payment icon row. Fetch `footer_links` grouped by `column_name`.

- [ ] **Step 6: Create `app/(storefront)/layout.tsx`**

```typescript
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add components/layout app/(storefront)/layout.tsx
git commit -m "feat: add storefront header, mega-menu, and footer"
```

---

### Task 7: Product Components

**Files:**
- Create: `components/product/price-display.tsx`, `star-rating.tsx`, `badge.tsx`, `product-card.tsx`, `product-grid.tsx`, `product-carousel.tsx`, `section-heading.tsx`

**Interfaces:**
- Produces: `<ProductCard product={product} />`, `<ProductCarousel products={[]} title="" viewAllHref="" />`

- [ ] **Step 1: Write failing test for `PriceDisplay`**

`tests/unit/price-display.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { PriceDisplay } from "@/components/product/price-display";

it("formats cents as AUD dollars", () => {
  render(<PriceDisplay cents={245000} />);
  expect(screen.getByText("$2,450.00")).toBeInTheDocument();
});
```

- [ ] **Step 2: Implement `components/product/price-display.tsx`**

```typescript
export function PriceDisplay({ cents }: { cents: number }) {
  const formatted = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(cents / 100);
  return <span className="font-bold text-gray-900">{formatted}</span>;
}
```

- [ ] **Step 3: Implement `star-rating.tsx`, `badge.tsx`, `product-card.tsx`**

`ProductCard`: link to `/products/{slug}`, image via `next/image`, optional badge top-left, title uppercase `text-sm`, `PriceDisplay`, `StarRating`.

- [ ] **Step 4: Implement `product-carousel.tsx`** (`"use client"`)

Uses shadcn `Carousel`; maps products to `ProductCard`.

- [ ] **Step 5: Run tests and commit**

```bash
npm run test
git add components/product tests/unit
git commit -m "feat: add product card, price display, and carousel components"
```

---

### Task 8: Homepage Sections

**Files:**
- Create: `lib/homepage.ts`
- Create: `components/homepage/*.tsx` (11 section components)
- Create: `app/(storefront)/page.tsx`

**Interfaces:**
- Consumes: `getProducts()`, homepage table fetchers from `lib/homepage.ts`
- Produces: rendered homepage with all 11 sections

- [ ] **Step 1: Create `lib/homepage.ts`**

Fetchers: `getHeroes()`, `getPromos()`, `getCollections()`, `getInspirationImages()`, `getSiteConfig()`.

- [ ] **Step 2: Build section components**

| File | Type |
|------|------|
| `hero-carousel.tsx` | client |
| `collection-cards.tsx` | server |
| `category-icon-grid.tsx` | server |
| `promo-banner.tsx` | server |
| `inspiration-grid.tsx` | server |
| `trust-bar.tsx` | server (4 items, no showroom) |
| `newsletter-signup.tsx` | client |

Reuse `ProductCarousel` + `SectionHeading` for featured, best sellers, new arrivals.

- [ ] **Step 3: Assemble `app/(storefront)/page.tsx`**

```typescript
export const revalidate = 60;

export default async function HomePage() {
  const [featured, bestSellers, newArrivals] = await Promise.all([
    getProducts({ featured: true, limit: 4 }),
    getProducts({ badge: "best_seller", limit: 4 }),
    getProducts({ limit: 4 }),
  ]);
  return (
    <>
      <HeroCarousel slides={await getHeroes()} />
      <ProductCarousel products={featured} title="FEATURED PRODUCTS" viewAllHref="/collections/premium" />
      <CollectionCards collections={await getCollections()} />
      <CategoryIconGrid />
      <PromoBanner promo={(await getPromos())[0]} />
      <ProductCarousel products={bestSellers} title="BEST SELLERS" viewAllHref="/collections/best-sellers" />
      <ProductCarousel products={newArrivals} title="NEW ARRIVALS" viewAllHref="/collections/new" />
      <InspirationGrid images={await getInspirationImages()} />
      <TrustBar />
      <NewsletterSignup />
    </>
  );
}
```

- [ ] **Step 4: Verify homepage renders**

```bash
npm run dev
# Visit http://localhost:3000 — all 11 sections visible
```

- [ ] **Step 5: Commit**

```bash
git add lib/homepage.ts components/homepage app/(storefront)/page.tsx
git commit -m "feat: add full homepage with all 11 sections"
```

---

### Task 9: Catalog Pages — PLP, PDP, Search, Collections

**Files:**
- Create: `app/(storefront)/categories/[slug]/page.tsx`
- Create: `app/(storefront)/products/[slug]/page.tsx`
- Create: `app/(storefront)/collections/[slug]/page.tsx`
- Create: `app/(storefront)/search/page.tsx`
- Create: `app/(storefront)/inspiration/page.tsx`
- Create: `app/(storefront)/sale/page.tsx`
- Create: `components/product/product-gallery.tsx`

- [ ] **Step 1: PLP `categories/[slug]/page.tsx`**

`revalidate = 60`. Breadcrumbs, `ProductGrid`, cursor pagination (load more), sort dropdown (client island). Filter sidebar deferred to basic category filter in Phase 1.

- [ ] **Step 2: PDP `products/[slug]/page.tsx`**

`revalidate = 300`. `generateMetadata()` from product SEO fields. `ProductGallery`, product info, disabled "ADD TO CART" button (checkout flag off). Related products carousel. Include JSON-LD via `lib/seo/json-ld.ts`.

- [ ] **Step 3: Create `lib/seo/json-ld.ts`**

```typescript
import type { Product } from "@/lib/supabase/types";

export function productJsonLd(product: Product, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    image: product.product_images?.map((i) => i.url) ?? [],
    description: product.description,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2),
      priceCurrency: "AUD",
      availability: product.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteUrl}/products/${product.slug}`,
    },
  };
}
```

- [ ] **Step 4: Search page**

`search/page.tsx` reads `searchParams.q`, queries products via Supabase full-text: `.textSearch("search_vector", query)`.

- [ ] **Step 5: Collections + sale pages**

`/collections/[slug]` filters by `collection_slugs`. `/sale` redirects or renders collection `sale`.

- [ ] **Step 6: Commit**

```bash
git add app/(storefront)/categories app/(storefront)/products app/(storefront)/search app/(storefront)/collections app/(storefront)/inspiration app/(storefront)/sale lib/seo
git commit -m "feat: add PLP, PDP, search, and collection pages"
```

---

### Task 10: Analytics Layer

**Files:**
- Create: `lib/analytics/events.ts`, `lib/analytics/track.ts`, `components/analytics/posthog-provider.tsx`

**Interfaces:**
- Produces: `track(event, properties)` — typed, no-op when `ANALYTICS_ENABLED=false`

- [ ] **Step 1: Write failing test**

```typescript
import { track } from "@/lib/analytics/track";

it("no-ops when analytics disabled", async () => {
  process.env.ANALYTICS_ENABLED = "false";
  await expect(track("page_view", { path: "/" })).resolves.toBeUndefined();
});
```

- [ ] **Step 2: Implement `lib/analytics/events.ts`**

```typescript
export type AnalyticsEvent =
  | { name: "page_view"; properties: { path: string; referrer?: string } }
  | { name: "product_impression"; properties: { product_id: string; position: number; category?: string } }
  | { name: "product_click"; properties: { product_id: string; source: string } }
  | { name: "product_view"; properties: { product_id: string; name: string; price: number } };
```

- [ ] **Step 3: Implement `lib/analytics/track.ts`**

Fire-and-forget; try/catch; check `ANALYTICS_ENABLED`; dynamic import posthog only when enabled.

- [ ] **Step 4: Add `PostHogProvider` to root layout** (client, wraps storefront)

- [ ] **Step 5: Wire `product_click` in `ProductCard` onClick**

- [ ] **Step 6: Commit**

```bash
git add lib/analytics components/analytics
git commit -m "feat: add typed analytics layer with PostHog provider"
```

---

### Task 11: SEO — Sitemap, Robots, Metadata

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`, `lib/seo/metadata.ts`

- [ ] **Step 1: Create `app/robots.ts`**

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/cart", "/checkout", "/account"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
```

- [ ] **Step 2: Create `app/sitemap.ts`**

Fetch all active product slugs + category slugs from Supabase; return `MetadataRoute.Sitemap` entries.

- [ ] **Step 3: Add `generateMetadata` to PDP and PLP**

Use `lib/seo/metadata.ts` helper; fallback meta_title → product.name.

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts app/robots.ts lib/seo
git commit -m "feat: add sitemap, robots, and dynamic metadata"
```

---

### Task 12: AI-Readiness API Routes

**Files:**
- Create: `app/api/v1/products/route.ts`, `app/api/v1/products/[slug]/route.ts`, `app/api/v1/categories/route.ts`, `app/api/v1/search/route.ts`, `app/api/v1/openapi.json/route.ts`, `app/api/feeds/products.json/route.ts`, `public/llms.txt`

- [ ] **Step 1: Create products list API**

`GET /api/v1/products` — paginated (`?page=1&limit=20`), returns `{ data: Product[], meta: { page, limit, total } }`.

- [ ] **Step 2: Create single product, categories, search routes**

Mirror `lib/products.ts` queries; return JSON with `Content-Type: application/json`.

- [ ] **Step 3: Create OpenAPI spec route**

Static JSON documenting all v1 endpoints at `app/api/v1/openapi.json/route.ts`.

- [ ] **Step 4: Create `public/llms.txt`**

```
# DavidEcomm
> Premium fixtures e-commerce — bathroom, doors & hardware, kitchen & laundry.

## API
- OpenAPI: {SITE_URL}/api/v1/openapi.json
- Products: {SITE_URL}/api/v1/products
- Feed: {SITE_URL}/api/feeds/products.json
```

- [ ] **Step 5: Write API integration test**

`tests/unit/api-products.test.ts` — mock Supabase, assert response shape.

- [ ] **Step 6: Commit**

```bash
git add app/api public/llms.txt tests/unit/api-products.test.ts
git commit -m "feat: add public v1 API, product feed, and llms.txt"
```

---

### Task 13: Stub Pages & Newsletter API

**Files:**
- Create: `app/(storefront)/cart/page.tsx`, `app/(storefront)/account/page.tsx`, `app/api/newsletter/route.ts`

- [ ] **Step 1: Cart stub**

Empty cart illustration + "Continue Shopping" CTA. Guard: if `ENABLE_CHECKOUT=true` redirect to functional cart (Phase 2).

- [ ] **Step 2: Account stub**

"Sign in coming soon" message; link placeholder for Phase 4.

- [ ] **Step 3: Newsletter API stub**

`POST /api/newsletter` — validate email with zod; return `{ success: true }`; no persistence Phase 1.

- [ ] **Step 4: Commit**

```bash
git add app/(storefront)/cart app/(storefront)/account app/api/newsletter
git commit -m "feat: add cart/account stubs and newsletter API"
```

---

### Task 14: CI Pipeline & Smoke Tests

**Files:**
- Create: `.github/workflows/ci.yml`, `tests/e2e/smoke-catalog.spec.ts`, `playwright.config.ts`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

Jobs: `lint`, `typecheck`, `test` (vitest), `build`, `e2e` (playwright against built app with env secrets).

- [ ] **Step 2: Create Playwright smoke test**

```typescript
import { test, expect } from "@playwright/test";

test("homepage renders hero and product sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /featured/i })).toBeVisible();
});

test("product page renders with JSON-LD", async ({ page }) => {
  await page.goto("/products/avila-1500-fluted-oak"); // use seeded slug
  await expect(page.locator('script[type="application/ld+json"]')).toBeAttached();
});
```

- [ ] **Step 3: Run locally**

```bash
npm run build
npm run test:e2e
```

- [ ] **Step 4: Commit**

```bash
git add .github tests/e2e playwright.config.ts
git commit -m "ci: add GitHub Actions pipeline and catalog smoke tests"
```

---

### Task 15: Vercel Deployment & Phase 1 Verification

**Files:**
- Modify: Vercel project settings (dashboard)
- Create: `README.md` setup instructions

- [ ] **Step 1: Link repo to Vercel**

Connect GitHub repo; set env vars from `.env.example`.

- [ ] **Step 2: Run Phase 1 exit checklist**

| Criterion | Verify |
|-----------|--------|
| Products from Supabase on preview | Visit preview URL |
| Analytics events in PostHog | Enable `ANALYTICS_ENABLED=true` on preview; click product |
| LCP < 2.5s | Lighthouse mobile on PDP |
| Sitemap live | `/sitemap.xml` |
| JSON-LD on PDP | View page source |
| Public API works | `curl /api/v1/products` |
| Feature flags off | `/cart` stub only; no checkout |
| Lighthouse ≥ 90 | Run Lighthouse CI |
| Bundle < 150kb | `npm run build` + analyze |

- [ ] **Step 3: Update README with local setup steps**

- [ ] **Step 4: Final commit and push**

```bash
git add README.md
git commit -m "docs: add Phase 1 setup and verification instructions"
git push -u origin cursor/phase-1-implementation-ee03
```

---

## Spec Coverage Checklist

| Spec requirement | Task |
|------------------|------|
| Supabase product schema | Task 3 |
| Seed data + 3 pillar nav | Task 5 |
| Full homepage (11 sections) | Task 8 |
| Mega-menu 3 pillars | Task 6 |
| PLP / PDP / search | Task 9 |
| ISR revalidation | Tasks 8, 9 |
| Analytics events Phase 1 | Task 10 |
| JSON-LD, sitemap, robots | Task 11 |
| Public API + feed + llms.txt | Task 12 |
| OpenAPI spec | Task 12 |
| Lighthouse CI | Task 14 |
| Smoke tests | Task 14 |
| Design tokens navy/gold | Task 2 |
| Trust bar (4 items, no showroom) | Task 8 |
| Footer menu + contact | Task 6 |
| Feature flags | Tasks 13, 15 |
| `next/image` everywhere | Tasks 7, 9 |
| Stub cart/account | Task 13 |

---

## Execution Order Summary

```
Task 1  → Scaffold
Task 2  → Design system
Task 3  → DB schema
Task 4  → Supabase clients + types
Task 5  → Seed + data layer
Task 6  → Layout (header/footer/nav)
Task 7  → Product components
Task 8  → Homepage
Task 9  → Catalog pages
Task 10 → Analytics
Task 11 → SEO
Task 12 → AI API
Task 13 → Stubs
Task 14 → CI
Task 15 → Deploy + verify
```

Tasks 10–12 can run in parallel after Task 9. Task 14 requires Tasks 1–13 complete.
