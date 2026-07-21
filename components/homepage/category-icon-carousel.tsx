"use client";

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
  Truck,
  Waves,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const iconMap: Record<string, LucideIcon> = {
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

export interface CategoryIconItem {
  id: string;
  slug: string;
  name: string;
}

export function CategoryIconCarousel({ items }: { items: CategoryIconItem[] }) {
  return (
    <div className="px-10">
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
          containScroll: "trimSnaps",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {items.map((item) => {
            const Icon = iconMap[item.slug] ?? Truck;

            return (
              <CarouselItem
                key={item.id}
                className="basis-[88px] pl-3 sm:basis-[100px] md:basis-[108px]"
              >
                <Link
                  href={`/categories/${item.slug}`}
                  className="group flex w-full flex-col items-center gap-2 rounded-md border border-saltwater bg-white px-2 py-3 text-center transition-colors hover:border-warm-stone"
                >
                  <div className="flex size-11 items-center justify-center rounded-md border border-saltwater text-inkjet transition-colors group-hover:border-warm-stone group-hover:text-warm-stone-600 sm:size-12">
                    <Icon className="size-5 sm:size-6" />
                  </div>
                  <span className="line-clamp-2 text-xs leading-tight font-medium text-tangaroa">
                    {item.name}
                  </span>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-0 border-saltwater bg-white hover:border-warm-stone" />
        <CarouselNext className="right-0 border-saltwater bg-white hover:border-warm-stone" />
      </Carousel>
    </div>
  );
}
