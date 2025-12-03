/**
 * Objective Review Form Component
 * Handles creating and editing reviews for objectives
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createObjectiveReview,
  updateObjectiveReview,
} from "@/lib/supabase/mutations/objective-reviews";

const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  comment: z.string().min(20, "Comment must be at least 20 characters").max(1000),
  travel_date: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ObjectiveReviewFormProps {
  objectiveId: string;
  objectiveTitle: string;
  existingReview?: {
    id: string;
    rating: number;
    title?: string;
    comment?: string;
    travel_date?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ObjectiveReviewForm({
  objectiveId,
  objectiveTitle,
  existingReview,
  onSuccess,
  onCancel,
}: ObjectiveReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      title: existingReview?.title || "",
      comment: existingReview?.comment || "",
      travel_date: existingReview?.travel_date || "",
    },
  });

  const handleRatingClick = (value: number) => {
    setRating(value);
    setValue("rating", value);
  };

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    try {
      if (existingReview) {
        await updateObjectiveReview(existingReview.id, {
          ...data,
          travel_date: data.travel_date?.trim() || null,
        });
      } else {
        await createObjectiveReview({
          objective_id: objectiveId,
          rating: data.rating,
          title: data.title,
          comment: data.comment,
          travel_date: data.travel_date?.trim() || null,
        });
      }
      onSuccess?.();
    } catch (error: any) {
      console.error("Review submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingReview ? "Edit Your Review" : "Write a Review"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your experience visiting {objectiveTitle}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Rating Stars */}
          <div className="space-y-2">
            <Label htmlFor="rating">Rating *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRatingClick(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      value <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Sum up your experience"
              maxLength={100}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review *</Label>
            <Textarea
              id="comment"
              {...register("comment")}
              placeholder="Tell us about your visit..."
              rows={6}
              maxLength={1000}
            />
            {errors.comment && (
              <p className="text-sm text-destructive">{errors.comment.message}</p>
            )}
          </div>

          {/* Visit Date */}
          <div className="space-y-2">
            <Label htmlFor="travel_date">Date of Visit (optional)</Label>
            <Input
              id="travel_date"
              type="date"
              {...register("travel_date")}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting
                ? "Submitting..."
                : existingReview
                ? "Update Review"
                : "Submit Review"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>

          {!existingReview && (
            <p className="text-sm text-muted-foreground">
              Your review will be visible after approval by our team.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
