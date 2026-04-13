import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readOnly = false,
  className,
}) => {
  const [hovered, setHovered] = useState<number>(0);

  const activeRating = hovered > 0 ? hovered : value;

  const handleMouseEnter = (star: number) => {
    if (!readOnly) setHovered(star);
  };

  const handleMouseLeave = () => {
    if (!readOnly) setHovered(0);
  };

  const handleClick = (star: number) => {
    if (!readOnly && onChange) onChange(star);
  };

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={handleMouseLeave}
      aria-label={`Rating: ${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          className={cn(
            "text-3xl leading-none transition-transform duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm",
            !readOnly && "cursor-pointer hover:scale-110",
            readOnly && "cursor-default",
            star <= activeRating
              ? "text-yellow-400"
              : "text-gray-300 dark:text-gray-600"
          )}
        >
          ★
        </button>
      ))}
      {!readOnly && (
        <span className="ml-2 text-sm font-medium text-muted-foreground min-w-[4.5rem]">
          {activeRating > 0
            ? `${activeRating} star${activeRating !== 1 ? "s" : ""}`
            : "No rating"}
        </span>
      )}
    </div>
  );
};

export default StarRating;
