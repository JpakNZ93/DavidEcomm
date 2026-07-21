import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-grey">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:text-inkjet">
            Home
          </Link>
        </li>
        {items.map((item) => (
          <li key={`${item.label}-${item.href ?? "current"}`} className="flex items-center gap-2">
            <ChevronRight className="size-4" aria-hidden="true" />
            {item.href ? (
              <Link href={item.href} className="hover:text-inkjet">
                {item.label}
              </Link>
            ) : (
              <span className="text-tangaroa">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
