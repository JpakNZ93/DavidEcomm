import { Star } from "lucide-react";

export function StarRating({
  rating,
  count,
}: {
  rating: number;
  count: number;
}) {
  const filledStars = Math.round(rating);

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <div className="flex items-center gap-0.5 text-gold-500" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className="size-3.5"
            fill={index < filledStars ? "currentColor" : "none"}
          />
        ))}
      </div>
      <span>({count})</span>
    </div>
  );
}
