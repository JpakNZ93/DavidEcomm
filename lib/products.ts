import { unstable_cache } from "next/cache";

import { getCachedCategories } from "@/lib/categories";
import { mockProducts } from "@/lib/mock/data";
import { createClient, createPublicClient } from "@/lib/supabase/server";
import type { Product, ProductBadge } from "@/lib/supabase/types";

export interface ProductFilters {
  featured?: boolean;
  badge?: Exclude<ProductBadge, null>;
  collection?: string;
  categorySlug?: string;
  limit?: number;
  search?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "newest";
}

function sortProducts(products: Product[], sort: ProductFilters["sort"]) {
  const items = [...products];

  switch (sort) {
    case "price-asc":
      return items.sort((left, right) => left.price - right.price);
    case "price-desc":
      return items.sort((left, right) => right.price - left.price);
    case "featured":
      return items.sort(
        (left, right) =>
          Number(right.featured) - Number(left.featured) ||
          (right.review_count ?? 0) - (left.review_count ?? 0),
      );
    case "newest":
    default:
      return items.sort(
        (left, right) =>
          new Date(right.created_at ?? 0).getTime() -
          new Date(left.created_at ?? 0).getTime(),
      );
  }
}

async function getCategoryIdSet(slug?: string) {
  if (!slug) {
    return null;
  }

  const categories = await getCachedCategories();
  const target = categories.find((category) => category.slug === slug);

  if (!target) {
    return null;
  }

  const allowedIds = new Set<string>([target.id]);
  const queue = [target.id];

  while (queue.length > 0) {
    const parentId = queue.shift()!;

    for (const category of categories) {
      if (category.parent_id === parentId && !allowedIds.has(category.id)) {
        allowedIds.add(category.id);
        queue.push(category.id);
      }
    }
  }

  return allowedIds;
}

async function fetchSupabaseProducts(filters: ProductFilters) {
  const supabase = createPublicClient();

  if (!supabase) {
    return null;
  }

  let query = supabase
    .from("products")
    .select("*, product_images(*), categories(*)")
    .eq("active", true);

  if (filters.featured) {
    query = query.eq("featured", true);
  }

  if (filters.badge) {
    query = query.eq("badge", filters.badge);
  }

  if (filters.collection) {
    query = query.contains("collection_slugs", [filters.collection]);
  }

  const allowedIds = await getCategoryIdSet(filters.categorySlug);

  if (allowedIds && allowedIds.size > 0) {
    query = query.in("category_id", [...allowedIds]);
  }

  if (filters.search) {
    query = query.textSearch("search_vector", filters.search);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error || !data) {
    return null;
  }

  return data as Product[];
}

function applyMockFilters(products: Product[], filters: ProductFilters) {
  let items = [...products];

  if (filters.featured) {
    items = items.filter((product) => product.featured);
  }

  if (filters.badge) {
    items = items.filter((product) => product.badge === filters.badge);
  }

  if (filters.collection) {
    items = items.filter((product) =>
      product.collection_slugs.includes(filters.collection!),
    );
  }

  return items;
}

export async function getProducts(filters: ProductFilters = {}) {
  const supabaseProducts = await fetchSupabaseProducts(filters);
  const categoryIds = await getCategoryIdSet(filters.categorySlug);
  const baseProducts = supabaseProducts ?? mockProducts;

  let items = applyMockFilters(baseProducts, filters);

  if (categoryIds) {
    items = items.filter(
      (product) => product.category_id && categoryIds.has(product.category_id),
    );
  }

  if (filters.search) {
    const query = filters.search.toLowerCase();

    items = items.filter((product) => {
      const haystack = [
        product.name,
        product.description ?? "",
        product.brand ?? "",
        ...Object.values(product.attributes),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }

  const sorted = sortProducts(items, filters.sort ?? "newest");

  return typeof filters.limit === "number"
    ? sorted.slice(0, filters.limit)
    : sorted;
}

export async function getProductBySlug(slug: string) {
  const supabase = createPublicClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(*), categories(*)")
      .eq("slug", slug)
      .eq("active", true)
      .single();

    if (!error && data) {
      return data as Product;
    }
  }

  return mockProducts.find((product) => product.slug === slug) ?? null;
}

export function getCachedProductBySlug(slug: string) {
  return unstable_cache(
    async () => getProductBySlug(slug),
    [`product-${slug}`],
    {
      revalidate: 300,
      tags: [`product-${slug}`],
    },
  )();
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const products = await getProducts({
    categorySlug: product.categories?.slug,
    sort: "featured",
  });

  return products
    .filter((candidate) => candidate.id !== product.id)
    .slice(0, limit);
}

export async function searchProducts(query: string) {
  return getProducts({ search: query, sort: "featured" });
}

export async function getProductSlugs() {
  const products = await getProducts();

  return products.map((product) => product.slug);
}
