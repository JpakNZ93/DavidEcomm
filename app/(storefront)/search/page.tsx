import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGrid } from "@/components/product/product-grid";
import { searchProducts } from "@/lib/products";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const products = query ? await searchProducts(query) : [];

  return (
    <div className="section-space">
      <div className="site-shell space-y-8">
        <Breadcrumbs items={[{ label: "Search" }]} />
        <section className="rounded-md bg-gray-50 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-500">
            Search
          </p>
          <h1 className="mt-3 font-heading text-4xl text-gray-900 md:text-5xl">
            {query ? `Showing results for "${query}"` : "Search the catalog"}
          </h1>
          <p className="mt-4 text-base text-gray-600">
            {query
              ? `${products.length} result${products.length === 1 ? "" : "s"} found.`
              : "Use the search bar above to browse the DavidEcomm catalog."}
          </p>
        </section>
        <ProductGrid products={products} source="search" />
      </div>
    </div>
  );
}
