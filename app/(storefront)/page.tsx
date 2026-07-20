import { CategoryIconGrid } from "@/components/homepage/category-icon-grid";
import { CollectionCards } from "@/components/homepage/collection-cards";
import { HeroCarousel } from "@/components/homepage/hero-carousel";
import { InspirationGrid } from "@/components/homepage/inspiration-grid";
import { NewsletterSignup } from "@/components/homepage/newsletter-signup";
import { PromoBanner } from "@/components/homepage/promo-banner";
import { TrustBar } from "@/components/homepage/trust-bar";
import { ProductCarousel } from "@/components/product/product-carousel";
import { getHeroes, getCollections, getInspirationImages, getPromos } from "@/lib/homepage";
import { getProducts } from "@/lib/products";

export const revalidate = 60;

export default async function HomePage() {
  const [heroes, collections, inspirationImages, promos, featured, bestSellers, newArrivals] =
    await Promise.all([
      getHeroes(),
      getCollections(),
      getInspirationImages(),
      getPromos(),
      getProducts({ featured: true, limit: 4, sort: "featured" }),
      getProducts({ badge: "best_seller", limit: 4, sort: "featured" }),
      getProducts({ badge: "new", limit: 4, sort: "newest" }),
    ]);

  return (
    <>
      <HeroCarousel slides={heroes} />
      <ProductCarousel
        products={featured}
        title="Featured products"
        subtitle="Premium vanities, tapware and fixtures chosen to define the DavidEcomm point of view."
        viewAllHref="/collections/premium"
        ctaLabel="View collection"
        source="homepage-featured"
      />
      <CollectionCards collections={collections} />
      <CategoryIconGrid />
      <PromoBanner promo={promos[0] ?? null} />
      <ProductCarousel
        products={bestSellers}
        title="Best sellers"
        subtitle="The most-loved products in our bathroom, hardware and utility collections."
        viewAllHref="/collections/best-sellers"
        ctaLabel="View all"
        source="homepage-best-sellers"
      />
      <ProductCarousel
        products={newArrivals}
        title="New arrivals"
        subtitle="Fresh additions across the three flagship navigation pillars."
        viewAllHref="/collections/new"
        ctaLabel="View arrivals"
        source="homepage-new-arrivals"
      />
      <InspirationGrid images={inspirationImages.slice(0, 4)} title="Bathroom inspiration" />
      <TrustBar />
      <NewsletterSignup />
    </>
  );
}
