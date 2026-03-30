import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import StarRating from "./StarRating";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/config";
import { getSessionIdFromCookie } from "@/lib/utils";

interface ReviewFormProps {
  productId: number;
  onSuccess?: () => void;
  className?: string;
}

interface FormState {
  rating: number;
  comment: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onSuccess,
  className,
}) => {
  const [form, setForm] = useState<FormState>({ rating: 0, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRatingChange = (rating: number) => {
    setForm((prev) => ({ ...prev, rating }));
    setError(null);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, comment: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.rating === 0) {
      setError("Please select a star rating before submitting.");
      return;
    }

    if (form.comment.trim().length === 0) {
      setError("Please write a comment before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(
        apiUrl(`/api/v1/products/${productId}/reviews`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getSessionIdFromCookie()}`,
          },
          body: JSON.stringify({
            rating: form.rating,
            comment: form.comment.trim(),
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        setError(`Failed to submit review: ${text}`);
      } else {
        setSuccess(true);
        setForm({ rating: 0, comment: "" });
        onSuccess?.();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error submitting review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={cn("rounded-lg border bg-card p-6 text-center", className)}>
        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
          ✓ Review submitted!
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Thank you for your feedback.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setSuccess(false)}
        >
          Write another review
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("rounded-lg border bg-card p-6 space-y-5", className)}
      noValidate
    >
      <h3 className="text-base font-semibold">Leave a Review</h3>

      {/* Star rating */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Your Rating</label>
        <StarRating value={form.rating} onChange={handleRatingChange} />
      </div>

      {/* Comment */}
      <div className="space-y-1.5">
        <label htmlFor="review-comment" className="text-sm font-medium">
          Comment
        </label>
        <Textarea
          id="review-comment"
          name="comment"
          placeholder="Share your thoughts about this product…"
          rows={4}
          value={form.comment}
          onChange={handleCommentChange}
          disabled={submitting}
          aria-invalid={!!error}
        />
      </div>

      {/* Error message */}
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Submitting…" : "Submit Review"}
      </Button>
    </form>
  );
};

export default ReviewForm;
