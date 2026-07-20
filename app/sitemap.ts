import type { MetadataRoute } from "next";

import { getCategorySlugs } from "@/lib/categories";
import { getProductSlugs } from "@/lib/products";
import { getSiteUrl } from "@/lib/seo/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [productSlugs, categorySlugs] = await Promise.all([
    getProductSlugs(),
    getCategorySlugs(),
  ]);

  const staticRoutes = ["", "/inspiration", "/sale", "/search"];

  return [
    ...staticRoutes.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...categorySlugs.map((slug) => ({
      url: `${siteUrl}/categories/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...productSlugs.map((slug) => ({
      url: `${siteUrl}/products/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
