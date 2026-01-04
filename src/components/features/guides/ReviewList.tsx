/**
 * ReviewList Component
 * Display list of reviews with pagination and actions
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { GuideReview } from "@/types/guides";

interface ReviewWithUser extends GuideReview {
  profiles?: {  // Am schimbat aici numele câmpului pentru claritate
    full_name: string;
    avatar_url?: string;
  };
}

interface ReviewListProps {
  reviews: ReviewWithUser[];
  totalCount: number;
  currentPage: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  showGuideResponse?: boolean;
}

export function ReviewList({
  reviews,
  totalCount,
  currentPage,
  pageSize = 10,
  onPageChange,
  showGuideResponse = true,
}: ReviewListProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Acest ghid nu are încă recenzii.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recenzii ({totalCount})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.map((review, index) => (
          <div key={review.id}>
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.profiles?.avatar_url} />  {/* ← schimbat user → profiles */}
                <AvatarFallback>
                  {review.profiles?.full_name?.charAt(0).toUpperCase() || "?"}  {/* ← schimbat */}
                </AvatarFallback>
              </Avatar>

              {/* Review Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {review.profiles?.full_name || "Anonim"}  {/* ← schimbat */}
                      </span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.title && <div className="font-medium mb-1">{review.title}</div>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(review.created_at)}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-muted-foreground mb-2 whitespace-pre-wrap">{review.comment}</p>
                )}

                {review.travel_date && (
                  <div className="text-sm text-muted-foreground mb-2">
                    Călătorie: {formatDate(review.travel_date)}
                  </div>
                )}

                {/* Guide Response */}
                {showGuideResponse && review.guide_response && (
                  <div className="mt-3 ml-6 p-4 bg-muted rounded-lg border-l-4 border-primary">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-semibold text-sm">Răspuns de la ghid</div>
                      {review.guide_response_date && (
                        <div className="text-xs text-muted-foreground">
                          {formatDate(review.guide_response_date)}
                        </div>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{review.guide_response}</p>
                  </div>
                )}
              </div>
            </div>

            {index < reviews.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Pagina {currentPage} din {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Următorul
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}