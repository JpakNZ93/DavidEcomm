"use client";

import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { HomepageHero } from "@/lib/supabase/types";

export function HeroCarousel({ slides }: { slides: HomepageHero[] }) {
  const plugins = useMemo(
    () => [
      Autoplay({
        delay: 6000,
        stopOnInteraction: true,
      }),
    ],
    [],
  );

  return (
    <section className="relative bg-navy-900 text-white">
      <Carousel
        plugins={plugins}
        opts={{ loop: true }}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id}>
              <div className="relative min-h-[560px]">
                <Image
                  src={slide.image_url}
                  alt={slide.headline}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="site-shell relative flex min-h-[560px] items-end py-14 md:items-center">
                  <div className="max-w-2xl space-y-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold-500">
                      DavidEcomm
                    </p>
                    <h1 className="font-heading text-4xl leading-tight md:text-6xl">
                      {slide.headline}
                    </h1>
                    {slide.subheadline ? (
                      <p className="max-w-xl text-base text-white/85 md:text-lg">
                        {slide.subheadline}
                      </p>
                    ) : null}
                    {slide.cta_href && slide.cta_text ? (
                      <Link href={slide.cta_href} className="gold-cta">
                        {slide.cta_text}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-6 border-white/30 bg-white/10 text-white hover:bg-white/20" />
        <CarouselNext className="right-6 border-white/30 bg-white/10 text-white hover:bg-white/20" />
      </Carousel>
    </section>
  );
}
