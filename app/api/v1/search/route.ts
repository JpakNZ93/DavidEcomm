import { NextResponse } from "next/server";

import { searchProducts } from "@/lib/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";

  if (!query) {
    return NextResponse.json({
      data: [],
      meta: { query, total: 0 },
    });
  }

  const products = await searchProducts(query);

  return NextResponse.json({
    data: products,
    meta: {
      query,
      total: products.length,
    },
  });
}
