import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/product/section-heading";
import type { InspirationImage } from "@/lib/supabase/types";

export function InspirationGrid({
  images,
  title = "Inspiration",
}: {
  images: InspirationImage[];
  title?: string;
}) {
  return (
    <section className="section-space">
      <div className="site-shell">
        <SectionHeading
          title={title}
          subtitle="Lifestyle imagery and styled spaces to help shape your next renovation."
          href="/inspiration"
          ctaLabel="View gallery"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {images.map((image) => (
            <Link
              key={image.id}
              href="/inspiration"
              className="group relative block aspect-[4/5] overflow-hidden rounded-md"
            >
              <Image
                src={image.image_url}
                alt={image.alt_text}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
