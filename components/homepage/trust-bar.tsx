import { Award, BadgeCheck, MessageSquareMore, Truck } from "lucide-react";

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
    <section className="bg-gray-50 py-8">
      <div className="site-shell grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
    </section>
  );
}
