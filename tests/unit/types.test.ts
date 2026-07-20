import { describe, expect, it } from "vitest";

import type { Product } from "@/lib/supabase/types";

describe("Product type", () => {
  it("accepts catalog objects with required slug and price fields", () => {
    const product: Product = {
      id: "1",
      name: "Test Vanity",
      slug: "test-vanity",
      description: null,
      price: 245000,
      category_id: null,
      sku: "DAV-001",
      gtin: null,
      brand: null,
      attributes: {},
      meta_title: null,
      meta_description: null,
      og_image_url: null,
      in_stock: true,
      active: true,
      featured: false,
      badge: null,
      collection_slugs: [],
      rating: 4.5,
      review_count: 10,
    };

    expect(product.slug).toBe("test-vanity");
    expect(product.price).toBe(245000);
  });
});
