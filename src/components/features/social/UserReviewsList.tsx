/**
 * User Reviews List Component
 * Displays all reviews (objectives and guides) written by the user
 * 
 * Features:
 * - Combined objective and guide reviews
 * - Star ratings display
 * - Review content preview
 * - Links to reviewed content
 * - Helpful count display
 * - Pagination support
 */

import { useQuery } from "@tanstack/react-query";
import { getUserReviews } from "@/lib/supabase/queries/social";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, Loader2, MapPin, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface UserReviewsListProps {
  userId: string;
}

export function UserReviewsList({ userId }: UserReviewsListProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["userReviews", userId, page],
    queryFn: () => getUserReviews(userId, page, 12)
  });

  if (isLoading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!data || data.reviews.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Nicio recenzie încă</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {data.reviews.map((review) => {
        const isObjectiveReview = review.type === 'objective';
        const content = isObjectiveReview ? review.objective : review.guide;
        if (!content) return null;

        const linkTo = isObjectiveReview 
          ? `/obiective/${content.slug}`
          : `/ghizi/${content.slug}`;

        return (
          <Card key={review.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Image */}
                <Link to={linkTo} className="shrink-0">
                  <div className="w-24 h-24 rounded-lg overflow-hidden">
                    <img
                      src={isObjectiveReview ? content.featured_image : content.profile_image || "/placeholder.svg"}
                      alt={isObjectiveReview ? content.title : content.full_name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <Link to={linkTo} className="hover:text-primary">
                        <h3 className="font-semibold mb-1">
                          {isObjectiveReview ? content.title : content.full_name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {isObjectiveReview ? (
                            <>
                              <MapPin className="h-3 w-3 mr-1" />
                              Obiectiv
                            </>
                          ) : (
                            <>
                              <User className="h-3 w-3 mr-1" />
                              Ghid
                            </>
                          )}
                        </Badge>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {review.title && (
                    <h4 className="font-medium mb-2">{review.title}</h4>
                  )}

                  {review.comment && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {review.comment}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{review.helpful_count || 0} util{(review.helpful_count || 0) !== 1 ? 'e' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {data.hasMore && (
        <div className="flex justify-center pt-4">
          <Button 
            onClick={() => setPage(p => p + 1)}
            variant="outline"
          >
            Încarcă mai multe
          </Button>
        </div>
      )}
    </div>
  );
}