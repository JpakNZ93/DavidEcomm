import { NextResponse } from "next/server";

import { getProducts } from "@/lib/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Math.min(Number(searchParams.get("limit") || "20"), 100);
  const collection = searchParams.get("collection") || undefined;
  const categorySlug = searchParams.get("category") || undefined;
  const badge = searchParams.get("badge") || undefined;
  const sort =
    (searchParams.get("sort") as
      | "featured"
      | "price-asc"
      | "price-desc"
      | "newest"
      | null) || "newest";

  const allProducts = await getProducts({
    collection,
    categorySlug,
    badge: badge as "best_seller" | "new" | "sale" | undefined,
    sort,
  });

  const offset = (Math.max(page, 1) - 1) * limit;
  const data = allProducts.slice(offset, offset + limit);

  return NextResponse.json({
    data,
    meta: {
      page,
      limit,
      total: allProducts.length,
    },
  });
}
