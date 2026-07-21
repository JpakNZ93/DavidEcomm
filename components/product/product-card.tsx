"use client";

import Image from "next/image";
import Link from "next/link";

import { ProductBadge } from "@/components/product/badge";
import { PriceDisplay } from "@/components/product/price-display";
import { StarRating } from "@/components/product/star-rating";
import { track } from "@/lib/analytics/track";
import type { Product } from "@/lib/supabase/types";

export function ProductCard({
  product,
  source = "catalog",
}: {
  product: Product;
  source?: string;
}) {
  const image = product.product_images?.[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-md border border-saltwater bg-white transition-shadow hover:shadow-md"
      onClick={() =>
        void track("product_click", {
          product_id: product.id,
          source,
        })
      }
    >
      <div className="relative aspect-square overflow-hidden bg-saltwater-50">
        {product.badge ? (
          <ProductBadge badge={product.badge} className="absolute top-3 left-3 z-10" />
        ) : null}
        {image ? (
          <Image
            src={image.url}
            alt={image.alt_text}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="space-y-3 p-4">
        <h3 className="line-clamp-2 text-sm font-medium uppercase tracking-[0.12em] text-tangaroa">
          {product.name}
        </h3>
        <PriceDisplay cents={product.price} />
        <StarRating rating={product.rating} count={product.review_count} />
      </div>
    </Link>
  );
}
