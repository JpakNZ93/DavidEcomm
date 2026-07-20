import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionHeading } from "@/components/product/section-heading";
import type { HomepageCollection } from "@/lib/supabase/types";

export function CollectionCards({
  collections,
}: {
  collections: HomepageCollection[];
}) {
  return (
    <section className="section-space">
      <div className="site-shell">
        <SectionHeading
          title="Shop by collection"
          subtitle="Curated edits tailored to premium renovations, value-led projects and everyday finishing details."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group relative block min-h-[420px] overflow-hidden rounded-md"
            >
              <Image
                src={collection.image_url}
                alt={collection.name}
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-x-6 bottom-6 rounded-md bg-white p-6 shadow-lg">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-900">
                  {collection.name}
                </p>
                <p className="mt-3 text-sm text-gray-600">{collection.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-gray-900">
                  {collection.cta_text}
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
