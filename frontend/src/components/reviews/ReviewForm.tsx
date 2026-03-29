import React, { useState } from "react";
import { StarRating } from "@/components/reviews/StarRating";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ReviewFormProps {
  onSubmit?: (data: { rating: number; comment: string }) => void;
  className?: string;
}

export function ReviewForm({ onSubmit, className }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      return;
    }
    onSubmit?.({ rating, comment });
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "inherit",
    fontSize: "1rem",
    fontWeight: 400,
    border: "1.5px solid #d1d5db",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <form
      className={cn("flex flex-col gap-4", className)}
      onSubmit={handleSubmit}
      data-testid="review-form"
    >
      <div>
        <label
          className="mb-2 block text-left text-sm font-medium text-gray-700 dark:text-gray-300"
          htmlFor="review-rating"
        >
          Your rating
        </label>
        <StarRating
          id="review-rating"
          value={rating}
          onChange={setRating}
        />
      </div>

      <div>
        <label
          className="mb-1 block text-left text-sm font-medium text-gray-700 dark:text-gray-300"
          htmlFor="review-comment"
        >
          Review
        </label>
        <Textarea
          id="review-comment"
          name="comment"
          placeholder="Share your experience with this product…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[6rem] w-full px-4 py-2"
          data-testid="review-comment"
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.border = "1.5px solid #6b7280";
            e.currentTarget.style.boxShadow = "0 0 0 1.5px #6b7280";
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = "1.5px solid #d1d5db";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <Button
        type="submit"
        className="w-full text-black"
        disabled={rating < 1}
        style={{
          background: "#f3f4f6",
          color: "#111",
          border: "1.5px solid transparent",
          outline: "none",
          transition: "background 0.2s, border-color 0.2s",
        }}
        onMouseOver={(e) => {
          if (e.currentTarget.disabled) return;
          e.currentTarget.style.background = "#d1d5db";
          e.currentTarget.style.border = "1.5px solid #000";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "#f3f4f6";
          e.currentTarget.style.border = "1.5px solid transparent";
        }}
      >
        Submit review
      </Button>
    </form>
  );
}
