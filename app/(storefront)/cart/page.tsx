import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  return (
    <div className="section-space">
      <div className="site-shell space-y-8">
        <Breadcrumbs items={[{ label: "Cart" }]} />
        <section className="mx-auto max-w-3xl rounded-md border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-500">
            Cart
          </p>
          <h1 className="mt-3 font-heading text-4xl text-gray-900">Your cart is empty</h1>
          <p className="mt-4 text-base text-gray-600">
            Checkout is intentionally disabled in Phase 1 while we focus on catalog discovery and merchandising.
          </p>
          <Button asChild className="gold-cta mt-6">
            <Link href="/">Continue shopping</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
