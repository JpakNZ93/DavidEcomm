import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGrid } from "@/components/product/product-grid";
import { getProducts } from "@/lib/products";

export default async function SalePage() {
  const products = await getProducts({ collection: "sale", sort: "featured" });

  return (
    <div className="section-space">
      <div className="site-shell space-y-8">
        <Breadcrumbs items={[{ label: "Sale" }]} />
        <section className="rounded-md bg-sale-red p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
            Limited time only
          </p>
          <h1 className="mt-3 font-heading text-4xl md:text-5xl">On Sale</h1>
          <p className="mt-4 max-w-2xl text-base text-white/80">
            Reduced favourites across the DavidEcomm catalog while stock lasts.
          </p>
        </section>
        <ProductGrid products={products} source="sale" />
      </div>
    </div>
  );
}
