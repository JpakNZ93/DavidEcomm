import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  return (
    <div className="section-space">
      <div className="site-shell space-y-8">
        <Breadcrumbs items={[{ label: "Account" }]} />
        <section className="mx-auto max-w-3xl rounded-md border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-500">
            Account
          </p>
          <h1 className="mt-3 font-heading text-4xl text-gray-900">
            Sign in is coming soon
          </h1>
          <p className="mt-4 text-base text-gray-600">
            Customer accounts are planned for a later phase. In the meantime, browse the catalog and save your favourites manually.
          </p>
          <Button asChild className="gold-cta mt-6">
            <Link href="/">Return to homepage</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
