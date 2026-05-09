"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

const sizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const textSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function StarRating({
  rating,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
  reviewCount,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const display = hovered ?? rating;

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(display);
          const partial = !filled && i < display;

          return (
            <button
              key={i}
              type={interactive ? "button" : undefined}
              className={cn(
                "relative",
                interactive && "cursor-pointer hover:scale-110 transition-transform"
              )}
              onClick={interactive ? () => onChange?.(i + 1) : undefined}
              onMouseEnter={interactive ? () => setHovered(i + 1) : undefined}
              onMouseLeave={interactive ? () => setHovered(null) : undefined}
            >
              {partial ? (
                <div className="relative">
                  <Star
                    className={cn(sizes[size], "text-zinc-200 dark:text-zinc-700")}
                    fill="currentColor"
                  />
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${(display - Math.floor(display)) * 100}%` }}
                  >
                    <Star
                      className={cn(sizes[size], "text-amber-400")}
                      fill="currentColor"
                    />
                  </div>
                </div>
              ) : (
                <Star
                  className={cn(
                    sizes[size],
                    filled
                      ? "text-amber-400"
                      : "text-zinc-200 dark:text-zinc-700"
                  )}
                  fill="currentColor"
                />
              )}
            </button>
          );
        })}
      </div>
      {showValue && (
        <span
          className={cn(
            "font-semibold text-zinc-900 dark:text-white",
            textSizes[size]
          )}
        >
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={cn("text-zinc-500 dark:text-zinc-400", textSizes[size])}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
