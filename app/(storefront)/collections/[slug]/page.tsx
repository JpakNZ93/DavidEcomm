import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGrid } from "@/components/product/product-grid";
import { mockCollectionDescriptions } from "@/lib/mock/data";
import { getProducts } from "@/lib/products";
import { buildPageMetadata } from "@/lib/seo/metadata";

const allowedCollections = new Set(Object.keys(mockCollectionDescriptions));

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (!allowedCollections.has(slug)) {
    return {};
  }

  return buildPageMetadata({
    title: `${titleFromSlug(slug)} Collection`,
    description:
      mockCollectionDescriptions[slug] || "Curated BDK Supply collection.",
    path: `/collections/${slug}`,
  });
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!allowedCollections.has(slug)) {
    notFound();
  }

  const products =
    slug === "new"
      ? await getProducts({ badge: "new", sort: "newest" })
      : await getProducts({ collection: slug, sort: "featured" });

  return (
    <div className="section-space">
      <div className="site-shell space-y-8">
        <Breadcrumbs items={[{ label: "Collections", href: "/" }, { label: titleFromSlug(slug) }]} />
        <section className="rounded-md bg-saltwater-50 p-8">
          <p className="brand-eyebrow-dark">Collection</p>
          <h1 className="mt-3 font-heading text-4xl text-tangaroa md:text-5xl">
            {titleFromSlug(slug)}
          </h1>
          <p className="mt-4 max-w-3xl text-base text-slate-grey">
            {mockCollectionDescriptions[slug]}
          </p>
        </section>
        <ProductGrid products={products} source={`collection-${slug}`} />
      </div>
    </div>
  );
}
