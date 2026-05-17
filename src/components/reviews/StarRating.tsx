import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  forceShow?: boolean;
  className?: string;
}

const starSizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };
const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };

export function StarRating({
  value,
  count,
  size = "md",
  forceShow = false,
  className,
}: StarRatingProps) {
  // Aggregate display (count provided) with too few reviews → badge
  if (count !== undefined && count < 5 && !forceShow) {
    return (
      <div className={cn("inline-flex items-center gap-1.5", className)}>
        <span
          className={cn(
            "bg-brand-50 text-brand-700 border border-brand-200 rounded-full px-2 py-0.5 font-medium",
            textSizes[size]
          )}
        >
          Nou pe MesteRO
        </span>
        {count > 0 && (
          <span className={cn("text-slate-500", textSizes[size])}>
            · {count} {count === 1 ? "recenzie" : "recenzii"}
          </span>
        )}
      </div>
    );
  }

  if (!value || value === 0) {
    return (
      <span className={cn("text-slate-400", textSizes[size], className)}>
        Nicio recenzie încă
      </span>
    );
  }

  const filled = Math.floor(value);
  const partial = value - filled;

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= filled;
          const isPartial = !isFilled && star === filled + 1 && partial >= 0.25;
          const partialPct = `${Math.round(partial * 100)}%`;

          return (
            <div key={star} className="relative">
              <Star className={cn(starSizes[size], "text-slate-200 fill-slate-200")} />
              {isFilled && (
                <div className="absolute inset-0">
                  <Star className={cn(starSizes[size], "text-brand-500 fill-brand-500")} />
                </div>
              )}
              {isPartial && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: partialPct }}
                >
                  <Star className={cn(starSizes[size], "text-brand-500 fill-brand-500")} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <span className={cn("font-semibold text-slate-900", textSizes[size])}>
        {value.toFixed(1)}
      </span>
      {count !== undefined && count > 0 && (
        <span className={cn("text-slate-500", textSizes[size])}>
          ({count} {count === 1 ? "recenzie" : "recenzii"})
        </span>
      )}
    </div>
  );
}
