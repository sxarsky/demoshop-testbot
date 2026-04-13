import React, { useState } from "react";
import { cn } from "@/lib/utils";

const STAR_COUNT = 5;

export interface StarRatingProps {
  /** Selected rating 1–5; use 0 when nothing is chosen yet. */
  value: number;
  onChange: (rating: number) => void;
  className?: string;
  id?: string;
  disabled?: boolean;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        "h-8 w-8 transition-colors duration-150",
        filled ? "text-amber-400" : "text-gray-300 dark:text-gray-600"
      )}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function StarRating({
  value,
  onChange,
  className,
  id,
  disabled = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const preview = hoverValue ?? value;
  const ratingLabel =
    preview === 0
      ? "Select a rating"
      : preview === 1
        ? "1 star"
        : `${preview} stars`;

  return (
    <div id={id} className={cn("flex flex-col gap-2", className)}>
      <div
        className="flex items-center gap-0.5"
        role="group"
        aria-label="Star rating"
        onMouseLeave={() => setHoverValue(null)}
      >
        {Array.from({ length: STAR_COUNT }, (_, i) => {
          const starValue = i + 1;
          const filled = preview > 0 && starValue <= preview;
          return (
            <button
              key={starValue}
              type="button"
              disabled={disabled}
              className={cn(
                "rounded p-0.5 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                !disabled && "cursor-pointer"
              )}
              aria-label={`${starValue} ${starValue === 1 ? "star" : "stars"}`}
              aria-pressed={value === starValue}
              onMouseEnter={() => !disabled && setHoverValue(starValue)}
              onClick={() => !disabled && onChange(starValue)}
            >
              <StarIcon filled={filled} />
            </button>
          );
        })}
      </div>
      <p
        className="text-sm text-muted-foreground"
        aria-live="polite"
        data-testid="star-rating-label"
      >
        {ratingLabel}
      </p>
    </div>
  );
}
