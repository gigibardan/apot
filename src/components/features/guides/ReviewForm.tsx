/**
 * ReviewForm Component
 * Form for creating or editing a guide review
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { createReview, updateReview } from "@/lib/supabase/mutations/reviews";
import type { GuideReview } from "@/types/guides";

const reviewSchema = z.object({
  rating: z.number().min(1, "Rating-ul este obligatoriu").max(5),
  title: z.string().max(100, "Titlul nu poate depăși 100 caractere").optional(),
  comment: z
    .string()
    .min(50, "Comentariul trebuie să aibă minim 50 caractere")
    .max(1000, "Comentariul nu poate depăși 1000 caractere"),
  travel_date: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  guideId: string;
  guideName: string;
  existingReview?: GuideReview;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  guideId,
  guideName,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
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
    defaultValues: existingReview
      ? {
          rating: existingReview.rating,
          title: existingReview.title || "",
          comment: existingReview.comment || "",
          travel_date: existingReview.travel_date || "",
        }
      : undefined,
  });

  const handleRatingClick = (value: number) => {
    setRating(value);
    setValue("rating", value);
  };

  const onSubmit = async (data: ReviewFormData) => {
    try {
      setIsSubmitting(true);

      if (existingReview) {
        await updateReview(existingReview.id, data);
        toast.success("Recenzia ta a fost actualizată!");
      } else {
        await createReview({
          guide_id: guideId,
          rating: data.rating!,
          title: data.title,
          comment: data.comment,
          travel_date: data.travel_date,
        });
        toast.success("Recenzia ta a fost trimisă și așteaptă aprobare!");
      }

      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "A apărut o eroare. Te rugăm să încerci din nou.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingReview ? "Editează Recenzia Ta" : `Lasă o Recenzie pentru ${guideName}`}
        </CardTitle>
        <CardDescription>
          {existingReview
            ? "Poți edita recenzia în primele 48 de ore de la publicare"
            : "Împărtășește experiența ta cu alți călători"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex items-center gap-2">
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
                    className={`h-8 w-8 ${
                      value <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 && (
                  <>
                    {rating === 1 && "Nesatisfăcător"}
                    {rating === 2 && "Acceptabil"}
                    {rating === 3 && "Bun"}
                    {rating === 4 && "Foarte bun"}
                    {rating === 5 && "Excelent"}
                  </>
                )}
              </span>
            </div>
            {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titlu (optional)</Label>
            <Input
              id="title"
              placeholder="Ex: Experiență memorabilă în Transilvania"
              {...register("title")}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              Recenzia Ta * <span className="text-sm text-muted-foreground">(minim 50 caractere)</span>
            </Label>
            <Textarea
              id="comment"
              rows={6}
              placeholder="Descrie experiența ta cu acest ghid. Ce ți-a plăcut cel mai mult? Ce ai învățat? Ai recomanda acest ghid?"
              {...register("comment")}
            />
            {errors.comment && <p className="text-sm text-destructive">{errors.comment.message}</p>}
          </div>

          {/* Travel Date */}
          <div className="space-y-2">
            <Label htmlFor="travel_date">Data Călătoriei (optional)</Label>
            <Input id="travel_date" type="date" {...register("travel_date")} />
            {errors.travel_date && (
              <p className="text-sm text-destructive">{errors.travel_date.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? existingReview
                  ? "Actualizare..."
                  : "Trimitere..."
                : existingReview
                  ? "Actualizează Recenzia"
                  : "Trimite Recenzia"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Anulează
              </Button>
            )}
          </div>

          {!existingReview && (
            <p className="text-sm text-muted-foreground">
              * Recenzia ta va fi verificată de echipa noastră înainte de a fi publicată.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
