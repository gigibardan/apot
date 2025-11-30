import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Star, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardReviewsProps {
  userId: string;
  limit?: number;
  compact?: boolean;
}

export function DashboardReviews({ userId, limit, compact = false }: DashboardReviewsProps) {
  const [activeTab, setActiveTab] = useState<"objectives" | "guides">("objectives");

  // Fetch objective reviews
  const { data: objectiveReviews, isLoading: objectivesLoading } = useQuery({
    queryKey: ["user-objective-reviews", userId, limit],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select(
          `
          id,
          rating,
          title,
          comment,
          created_at,
          approved,
          objective:objectives (
            id,
            title,
            slug,
            featured_image
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch guide reviews
  const { data: guideReviews, isLoading: guidesLoading } = useQuery({
    queryKey: ["user-guide-reviews", userId, limit],
    queryFn: async () => {
      let query = supabase
        .from("guide_reviews")
        .select(
          `
          id,
          rating,
          title,
          comment,
          created_at,
          approved,
          guide:guides (
            id,
            full_name,
            slug,
            profile_image
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const isLoading = objectivesLoading || guidesLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(limit || 3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  const totalReviews = (objectiveReviews?.length || 0) + (guideReviews?.length || 0);

  if (totalReviews === 0) {
    if (compact) {
      return (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nicio recenzie încă
        </p>
      );
    }

    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={<Star className="w-12 h-12" />}
            title="Nicio recenzie"
            description="Nu ai scris încă nicio recenzie"
            action={{
              label: "Explorează Obiective",
              href: "/obiective",
            }}
          />
        </CardContent>
      </Card>
    );
  }

  const renderReviews = (reviews: any[], type: "objective" | "guide") => {
    if (!reviews || reviews.length === 0) {
      return (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nicio recenzie {type === "objective" ? "pentru obiective" : "pentru ghizi"}
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {reviews.map((review) => {
          const entity = type === "objective" ? review.objective : review.guide;
          const slug = type === "objective" ? `/obiective/${entity.slug}` : `/ghizi/${entity.slug}`;
          const name = type === "objective" ? entity.title : entity.full_name;
          const image = type === "objective" ? entity.featured_image : entity.profile_image;

          return (
            <div key={review.id} className="p-4 rounded-lg border">
              <div className="flex items-start gap-4">
                <Link to={slug} className="flex-shrink-0">
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                      {type === "objective" ? (
                        <MapPin className="w-6 h-6 text-muted-foreground" />
                      ) : (
                        <User className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link to={slug} className="font-semibold hover:text-primary transition-colors">
                      {name}
                    </Link>
                    <Badge variant={review.approved ? "default" : "secondary"}>
                      {review.approved ? "Aprobat" : "În așteptare"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {review.title && (
                    <p className="font-medium mb-1">{review.title}</p>
                  )}

                  {review.comment && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {review.comment}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(review.created_at), "d MMM yyyy", { locale: ro })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (compact) {
    const allReviews = [
      ...(objectiveReviews || []).map((r) => ({ ...r, type: "objective" as const })),
      ...(guideReviews || []).map((r) => ({ ...r, type: "guide" as const })),
    ]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    return (
      <div className="space-y-3">
        {allReviews.map((review) => {
          const entity = review.type === "objective" ? review.objective : review.guide;
          const name = review.type === "objective" ? (entity as any).title : (entity as any).full_name;
          
          return (
            <div key={`${review.type}-${review.id}`} className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm font-medium truncate">{name}</p>
              {review.title && (
                <p className="text-sm text-muted-foreground truncate">{review.title}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recenziile Mele</CardTitle>
        <CardDescription>{totalReviews} recenzii scrise</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="objectives">
              Obiective ({objectiveReviews?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="guides">
              Ghizi ({guideReviews?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="objectives" className="mt-6">
            {renderReviews(objectiveReviews || [], "objective")}
          </TabsContent>

          <TabsContent value="guides" className="mt-6">
            {renderReviews(guideReviews || [], "guide")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
