import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  title,
  subtitle,
  href,
  ctaLabel = "View all",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <h2 className="section-heading">{title}</h2>
        {subtitle ? (
          <p className="max-w-2xl text-sm text-gray-600">{subtitle}</p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-gray-900 hover:text-gold-500"
        >
          {ctaLabel}
          <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
