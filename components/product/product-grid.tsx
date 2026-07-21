import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/supabase/types";

export function ProductGrid({
  products,
  source = "catalog",
}: {
  products: Product[];
  source?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-saltwater bg-saltwater-50 p-10 text-center text-sm text-slate-grey">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} source={source} />
      ))}
    </div>
  );
}
