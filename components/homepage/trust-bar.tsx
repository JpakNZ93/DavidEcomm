import { Award, BadgeCheck, MessageSquareMore, Truck } from "lucide-react";

import { SectionHeading } from "@/components/product/section-heading";

const trustItems = [
  {
    icon: Truck,
    label: "Shipping Australia Wide",
  },
  {
    icon: Award,
    label: "Premium Quality Products",
  },
  {
    icon: BadgeCheck,
    label: "Up to 15 Year Warranty",
  },
  {
    icon: MessageSquareMore,
    label: "Expert Advice & Support",
  },
];

export function TrustBar() {
  return (
    <section className="bg-gray-50 section-space">
      <div className="site-shell">
        <SectionHeading
          title="Why trust DavidEcomm"
          subtitle="Premium fixtures, dependable service, and support you can count on."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center justify-center gap-3 rounded-md border border-gray-200 bg-white px-5 py-4 text-center"
              >
                <Icon className="size-5 text-gold-500" />
                <span className="text-sm font-medium text-gray-900">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
