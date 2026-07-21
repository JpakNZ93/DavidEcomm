"use client";

import { useState } from "react";
import Image from "next/image";

import type { ProductImage } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const activeImage = images[selectedImage] ?? images[0];

  if (!activeImage) {
    return (
      <div className="rounded-md border border-dashed border-saltwater bg-saltwater-50 p-8 text-sm text-slate-grey">
        Product imagery coming soon.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
        <Image
          src={activeImage.url}
          alt={activeImage.alt_text}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border bg-gray-100",
                index === selectedImage
                  ? "border-inkjet ring-2 ring-inkjet/30"
                  : "border-gray-200",
              )}
              onClick={() => setSelectedImage(index)}
            >
              <Image
                src={image.url}
                alt={image.alt_text}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
