import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { HomepagePromo } from "@/lib/supabase/types";

export function PromoBanner({ promo }: { promo: HomepagePromo | null }) {
  if (!promo) {
    return null;
  }

  return (
    <section className="section-space">
      <div className="site-shell">
        <div className="grid overflow-hidden rounded-md bg-sale-red text-white lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 p-8 md:p-12">
            {promo.eyebrow ? (
              <span className="inline-flex rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                {promo.eyebrow}
              </span>
            ) : null}
            <div className="space-y-3">
              <h2 className="font-heading text-4xl md:text-5xl">{promo.headline}</h2>
              {promo.subtext ? (
                <p className="max-w-xl text-base text-white/80">{promo.subtext}</p>
              ) : null}
            </div>
            {promo.cta_href && promo.cta_text ? (
              <Link
                href={promo.cta_href}
                className="inline-flex items-center gap-2 rounded-sm bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-sale-red"
              >
                {promo.cta_text}
                <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </div>
          <div className="relative min-h-[280px]">
            {promo.image_url ? (
              <Image
                src={promo.image_url}
                alt={promo.headline}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
