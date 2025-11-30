/**
 * Objective Review List Component
 * Displays paginated list of reviews for an objective
 */

import { useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  visit_date?: string;
  created_at: string;
  helpful_count: number;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface ObjectiveReviewListProps {
  reviews: Review[];
  totalReviews: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ObjectiveReviewList({
  reviews,
  totalReviews,
  currentPage,
  totalPages,
  onPageChange,
}: ObjectiveReviewListProps) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No reviews yet. Be the first to share your experience!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
        </h3>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar>
                      <AvatarImage src={review.profiles?.avatar_url} />
                      <AvatarFallback>
                        {review.profiles?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {review.profiles?.full_name || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <time dateTime={review.created_at}>
                          {formatDate(review.created_at)}
                        </time>
                        {review.visit_date && (
                          <>
                            <span>•</span>
                            <span>Visited {formatDate(review.visit_date)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Title */}
                {review.title && (
                  <h4 className="font-semibold text-base">{review.title}</h4>
                )}

                {/* Comment */}
                {review.comment && (
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {review.comment}
                  </p>
                )}

                {/* Helpful Button */}
                <div className="flex items-center gap-2 pt-2">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Helpful ({review.helpful_count || 0})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
