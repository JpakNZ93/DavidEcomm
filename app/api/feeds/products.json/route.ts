import { NextResponse } from "next/server";

import { getProducts } from "@/lib/products";
import { getSiteUrl } from "@/lib/seo/metadata";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Math.min(Number(searchParams.get("limit") || "50"), 100);
  const products = await getProducts({ sort: "newest" });
  const offset = (Math.max(page, 1) - 1) * limit;
  const data = products.slice(offset, offset + limit).map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    sku: product.sku,
    price: product.price,
    currency: "AUD",
    availability: product.in_stock ? "in_stock" : "out_of_stock",
    url: `${getSiteUrl()}/products/${product.slug}`,
    category: product.categories?.name ?? null,
    image: product.product_images?.[0]?.url ?? null,
    brand: product.brand,
    attributes: product.attributes,
  }));

  return NextResponse.json({
    data,
    meta: {
      page,
      limit,
      total: products.length,
    },
  });
}
