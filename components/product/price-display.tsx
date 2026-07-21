import { cn } from "@/lib/utils";

export function formatAudPrice(cents: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(cents / 100);
}

export function PriceDisplay({
  cents,
  className,
}: {
  cents: number;
  className?: string;
}) {
  return <span className={cn("font-bold text-tangaroa", className)}>{formatAudPrice(cents)}</span>;
}
