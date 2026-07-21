import { NextResponse } from "next/server";

import { getSiteUrl } from "@/lib/seo/metadata";

export async function GET() {
  return NextResponse.json({
    openapi: "3.1.0",
    info: {
      title: "BDK Supply Catalog API",
      version: "1.0.0",
      description:
        "Public read API for the BDK Supply Phase 1 catalog, categories and search endpoints.",
    },
    servers: [{ url: getSiteUrl() }],
    paths: {
      "/api/v1/products": {
        get: {
          summary: "List products",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
            { name: "collection", in: "query", schema: { type: "string" } },
            { name: "category", in: "query", schema: { type: "string" } },
            { name: "badge", in: "query", schema: { type: "string" } },
          ],
        },
      },
      "/api/v1/products/{slug}": {
        get: {
          summary: "Get product by slug",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        },
      },
      "/api/v1/categories": {
        get: {
          summary: "List categories and navigation tree",
        },
      },
      "/api/v1/search": {
        get: {
          summary: "Search products",
          parameters: [{ name: "q", in: "query", schema: { type: "string" } }],
        },
      },
      "/api/feeds/products.json": {
        get: {
          summary: "Public machine-readable product feed",
        },
      },
    },
  });
}
