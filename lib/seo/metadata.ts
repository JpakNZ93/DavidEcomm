import type { Metadata } from "next";

import type { Category, Product } from "@/lib/supabase/types";

export const siteName = "DavidEcomm";
export const siteDescription =
  "Premium fixtures e-commerce for bathroom, doors & hardware, and kitchen & laundry.";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

export function buildDefaultMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: `${siteName} | Premium Fixtures`,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    applicationName: siteName,
    alternates: {
      canonical: absoluteUrl("/"),
    },
    openGraph: {
      type: "website",
      locale: "en_AU",
      url: absoluteUrl("/"),
      title: `${siteName} | Premium Fixtures`,
      description: siteDescription,
      siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} | Premium Fixtures`,
      description: siteDescription,
    },
  };
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: absoluteUrl(input.path),
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: absoluteUrl(input.path),
      images: input.image ? [{ url: input.image }] : undefined,
    },
    twitter: {
      title: input.title,
      description: input.description,
      images: input.image ? [input.image] : undefined,
    },
  };
}

export function buildProductMetadata(product: Product): Metadata {
  return buildPageMetadata({
    title: product.meta_title || product.name,
    description:
      product.meta_description ||
      product.description ||
      siteDescription,
    path: `/products/${product.slug}`,
    image:
      product.og_image_url || product.product_images?.[0]?.url || null,
  });
}

export function buildCategoryMetadata(category: Category): Metadata {
  return buildPageMetadata({
    title: category.meta_title || category.name,
    description:
      category.meta_description ||
      `Shop ${category.name.toLowerCase()} at ${siteName}.`,
    path: `/categories/${category.slug}`,
    image: category.mega_menu_image,
  });
}
