import Link from "next/link";
import {
  Bath,
  Boxes,
  Droplets,
  DoorOpen,
  Grip,
  House,
  ScanSearch,
  Shield,
  Sparkles,
  Waves,
  Wrench,
} from "lucide-react";

import { SectionHeading } from "@/components/product/section-heading";
import { getCachedCategories } from "@/lib/categories";

const iconMap = {
  vanities: Bath,
  toilets: Shield,
  basins: Droplets,
  tapware: Waves,
  showers: Sparkles,
  "mirrors-cabinets": ScanSearch,
  accessories: Grip,
  "door-handles": DoorOpen,
  "kitchen-sinks": House,
  "laundry-tubs": Boxes,
  "cabinet-handles": Wrench,
};

const featuredSlugs = Object.keys(iconMap);

export async function CategoryIconGrid() {
  const categories = await getCachedCategories();
  const items = featuredSlugs
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <section className="section-space bg-gray-50">
      <div className="site-shell">
        <SectionHeading
          title="Shop by category"
          subtitle="Explore the most-searched categories across the DavidEcomm catalog."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-11">
          {items.map((item) => {
            const Icon = iconMap[item.slug as keyof typeof iconMap];

            return (
              <Link
                key={item.id}
                href={`/categories/${item.slug}`}
                className="group flex flex-col items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-3 text-center transition-colors hover:border-gold-500"
              >
                <div className="flex size-11 items-center justify-center rounded-md border border-gray-200 text-navy-900 transition-colors group-hover:border-gold-500 group-hover:text-gold-500 sm:size-12">
                  <Icon className="size-5 sm:size-6" />
                </div>
                <span className="text-xs leading-tight font-medium text-gray-900">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
