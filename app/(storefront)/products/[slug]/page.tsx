import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGallery } from "@/components/product/product-gallery";
import { PriceDisplay } from "@/components/product/price-display";
import { ProductCarousel } from "@/components/product/product-carousel";
import { StarRating } from "@/components/product/star-rating";
import { Button } from "@/components/ui/button";
import { getCategoryAncestors } from "@/lib/categories";
import { getCachedProductBySlug, getRelatedProducts } from "@/lib/products";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/json-ld";
import { buildProductMetadata, getSiteUrl } from "@/lib/seo/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProductBySlug(slug);

  if (!product) {
    return {};
  }

  return buildProductMetadata(product);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCachedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [ancestors, relatedProducts] = await Promise.all([
    product.categories ? getCategoryAncestors(product.categories) : Promise.resolve([]),
    getRelatedProducts(product, 4),
  ]);

  const breadcrumbItems = [
    ...ancestors.map((ancestor) => ({
      label: ancestor.name,
      href: `${getSiteUrl()}/categories/${ancestor.slug}`,
    })),
    product.categories
      ? {
          label: product.categories.name,
          href: `${getSiteUrl()}/categories/${product.categories.slug}`,
        }
      : null,
    {
      label: product.name,
      href: `${getSiteUrl()}/products/${product.slug}`,
    },
  ].filter((item): item is { label: string; href: string } => Boolean(item));

  return (
    <div className="section-space">
      <div className="site-shell space-y-10">
        <Breadcrumbs
          items={[
            ...ancestors.map((ancestor) => ({
              label: ancestor.name,
              href: `/categories/${ancestor.slug}`,
            })),
            product.categories
              ? {
                  label: product.categories.name,
                  href: `/categories/${product.categories.slug}`,
                }
              : undefined,
            { label: product.name },
          ].filter((item): item is { label: string; href?: string } => Boolean(item))}
        />

        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <ProductGallery images={product.product_images ?? []} />
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="brand-eyebrow-dark">{product.brand}</p>
              <h1 className="font-heading text-4xl text-tangaroa md:text-5xl">
                {product.name}
              </h1>
              <StarRating rating={product.rating} count={product.review_count} />
            </div>
            <PriceDisplay cents={product.price} className="text-3xl" />
            <div className="space-y-3 border-y border-saltwater py-5 text-sm text-slate-grey">
              <p>SKU: {product.sku}</p>
              {Object.entries(product.attributes).map(([key, value]) => (
                <p key={key}>
                  <span className="font-semibold uppercase tracking-[0.12em] text-tangaroa">
                    {key}:
                  </span>{" "}
                  {value}
                </p>
              ))}
            </div>
            <p className="leading-7 text-slate-grey">{product.description}</p>
            <Button
              type="button"
              disabled
              className="gold-cta h-12 w-full rounded-full disabled:cursor-not-allowed disabled:opacity-70"
            >
              Add to cart coming soon
            </Button>
            <div className="rounded-md border border-saltwater bg-saltwater-50 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-tangaroa">
                Reviews
              </h2>
              <p className="mt-3 text-sm text-slate-grey">
                Reviews are coming soon. In Phase 1 we are focusing on catalog discovery, SEO and navigation.
              </p>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 ? (
          <ProductCarousel
            products={relatedProducts}
            title="Related products"
            subtitle="More fixtures and finishes from the same category."
            source={`related-${product.slug}`}
          />
        ) : null}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            productJsonLd(product, getSiteUrl()),
            breadcrumbJsonLd(
              breadcrumbItems.map((item) => ({
                name: item.label,
                url: item.href,
              })),
            ),
          ]),
        }}
      />
    </div>
  );
}
