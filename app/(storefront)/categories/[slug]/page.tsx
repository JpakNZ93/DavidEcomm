import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGrid } from "@/components/product/product-grid";
import { getCategoryAncestors, getCategoryBySlug, getCategoryChildren } from "@/lib/categories";
import { getProducts } from "@/lib/products";
import { buildCategoryMetadata } from "@/lib/seo/metadata";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {};
  }

  return buildCategoryMetadata(category);
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [products, ancestors, children] = await Promise.all([
    getProducts({ categorySlug: slug, sort: "featured" }),
    getCategoryAncestors(category),
    getCategoryChildren(category.id),
  ]);

  return (
    <div className="section-space">
      <div className="site-shell space-y-10">
        <Breadcrumbs
          items={[
            ...ancestors.map((ancestor) => ({
              label: ancestor.name,
              href: `/categories/${ancestor.slug}`,
            })),
            { label: category.name },
          ]}
        />

        <section className="grid gap-8 rounded-md bg-gray-50 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-500">
              Category
            </p>
            <h1 className="font-heading text-4xl text-gray-900 md:text-5xl">
              {category.name}
            </h1>
            <p className="max-w-2xl text-base text-gray-600">
              {category.meta_description ||
                `Explore curated ${category.name.toLowerCase()} from DavidEcomm.`}
            </p>
            <p className="text-sm font-medium text-gray-500">
              {products.length} product{products.length === 1 ? "" : "s"}
            </p>
          </div>
          {category.mega_menu_image ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-md">
              <Image
                src={category.mega_menu_image}
                alt={category.name}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </section>

        {children.length > 0 ? (
          <section className="space-y-4">
            <h2 className="section-heading">Explore subcategories</h2>
            <div className="flex flex-wrap gap-3">
              {children.map((child) => (
                <a
                  key={child.id}
                  href={`/categories/${child.slug}`}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:border-gold-500 hover:text-gold-500"
                >
                  {child.name}
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="section-heading">Products</h2>
            <p className="text-sm text-gray-500">Sorted by featured relevance</p>
          </div>
          <ProductGrid products={products} source={`category-${category.slug}`} />
        </section>
      </div>
    </div>
  );
}
