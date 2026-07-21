import { brand } from "@/lib/brand";
import { CategoryIconCarousel } from "@/components/homepage/category-icon-carousel";
import { SectionHeading } from "@/components/product/section-heading";
import { getCachedCategories } from "@/lib/categories";

const featuredSlugs = [
  "vanities",
  "toilets",
  "basins",
  "tapware",
  "showers",
  "mirrors-cabinets",
  "accessories",
  "door-handles",
  "kitchen-sinks",
  "laundry-tubs",
  "cabinet-handles",
] as const;

export async function CategoryIconGrid() {
  const categories = await getCachedCategories();
  const items = featuredSlugs
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
    }));

  return (
    <section className="section-space bg-saltwater-50">
      <div className="site-shell">
        <SectionHeading
          title="Shop by category"
          subtitle={`Explore the most-searched categories across the ${brand.name} catalog.`}
        />
        <CategoryIconCarousel items={items} />
      </div>
    </section>
  );
}
