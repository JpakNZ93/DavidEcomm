import { cn } from "@/lib/utils";
import type { ProductBadge as ProductBadgeType } from "@/lib/supabase/types";

const styles: Record<Exclude<ProductBadgeType, null>, string> = {
  best_seller: "bg-gold-500 text-white",
  new: "bg-navy-900 text-white",
  sale: "bg-sale-red text-white",
};

const labels: Record<Exclude<ProductBadgeType, null>, string> = {
  best_seller: "Best Seller",
  new: "New",
  sale: "Sale",
};

export function ProductBadge({
  badge,
  className,
}: {
  badge: Exclude<ProductBadgeType, null>;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
        styles[badge],
        className,
      )}
    >
      {labels[badge]}
    </span>
  );
}
