import { getCachedCategories } from "@/lib/categories";
import type { NavigationPillar, NavPillarKey } from "@/lib/supabase/types";

const pillarLabels: Record<NavPillarKey, string> = {
  bathroom: "Bathroom",
  "doors-hardware": "Doors & Hardware",
  "kitchen-laundry": "Kitchen & Laundry",
};

export async function getNavigationTree(): Promise<NavigationPillar[]> {
  const categories = await getCachedCategories();
  const pillars = categories.filter(
    (category) => category.parent_id === null && category.nav_pillar,
  );

  return pillars
    .sort((left, right) => left.mega_menu_order - right.mega_menu_order)
    .map((pillar) => ({
      slug: pillar.nav_pillar as NavPillarKey,
      label: pillarLabels[pillar.nav_pillar as NavPillarKey],
      category: pillar,
      children: categories
        .filter(
          (category) =>
            category.parent_id === pillar.id && category.show_in_mega_menu,
        )
        .sort((left, right) => left.mega_menu_order - right.mega_menu_order),
    }));
}
