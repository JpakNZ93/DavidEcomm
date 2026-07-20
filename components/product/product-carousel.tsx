"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/product/section-heading";
import type { Product } from "@/lib/supabase/types";

export function ProductCarousel({
  products,
  title,
  subtitle,
  viewAllHref,
  ctaLabel = "View collection",
  source = "carousel",
}: {
  products: Product[];
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  ctaLabel?: string;
  source?: string;
}) {
  return (
    <section className="section-space">
      <div className="site-shell">
        <SectionHeading
          title={title}
          subtitle={subtitle}
          href={viewAllHref}
          ctaLabel={ctaLabel}
        />
        <div className="px-10">
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent>
              {products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="basis-[82%] sm:basis-1/2 lg:basis-1/4"
                >
                  <ProductCard product={product} source={source} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 border-gray-300 bg-white" />
            <CarouselNext className="right-0 border-gray-300 bg-white" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
