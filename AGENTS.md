# AGENTS.md

## Cursor Cloud specific instructions

DavidEcomm is a single **Next.js 16 (App Router) + React 19** storefront at the repo root (no monorepo). Package manager is **npm** (`package-lock.json`); Node 22 is used in CI. Standard scripts and setup are documented in `README.md`.

### Running the app
- `npm run dev` starts the storefront on port **3000**. It runs fully on **mock catalog data** (`lib/mock/data.ts`) when Supabase env vars are absent, so no database/backend is required for local development. Supabase, PostHog, Stripe, Sanity, etc. are optional/future-phase.
- The update script copies `.env.example` to `.env.local` only if it is missing; safe defaults there keep analytics off. Do not commit `.env.local`.

### Lint / typecheck / test / build
Commands are defined in `package.json` (`lint`, `typecheck`, `test`, `build`, `test:e2e`). CI (`.github/workflows/ci.yml`) sets `ANALYTICS_ENABLED=false` and `NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000` for all jobs — mirror these env vars locally to match CI behavior.

### Non-obvious caveats
- `lib/products.ts` has a pre-existing ESLint warning (`'createClient' is defined but never used`); lint still exits 0 (warnings only, no errors). This is not introduced by setup.
- Playwright E2E (`npm run test:e2e`) is optional and needs browsers installed first: `npx playwright install --with-deps chromium`. Its `webServer` config runs a **production** `npm run build && npm run start` on port 3000 and, outside CI, reuses an already-running server on port 3000 — stop any dev server on 3000 first if you want a clean production run.
- Some mock products reference external Unsplash image URLs that may 404; this logs an `upstream image response failed` warning during build/tests but does not fail them.
