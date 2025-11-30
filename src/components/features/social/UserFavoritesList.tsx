/**
 * User Favorites List Component
 * Displays objectives favorited by the user in a grid layout
 * 
 * Features:
 * - Responsive grid layout
 * - Objective images and details
 * - Links to objective pages
 * - Pagination support
 * - Loading and empty states
 */

import { useQuery } from "@tanstack/react-query";
import { getUserFavorites } from "@/lib/supabase/queries/social";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface UserFavoritesListProps {
  userId: string;
}

export function UserFavoritesList({ userId }: UserFavoritesListProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["userFavorites", userId, page],
    queryFn: () => getUserFavorites(userId, page, 12)
  });

  if (isLoading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!data || data.favorites.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Niciun favorit încă</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.favorites.map((favorite) => {
          const objective = favorite.objective;
          if (!objective) return null;

          return (
            <Link 
              key={favorite.id} 
              to={`/obiective/${objective.slug}`}
              className="block group"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all">
                <AspectRatio ratio={16/9}>
                  <img
                    src={objective.featured_image || "/placeholder.svg"}
                    alt={objective.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </AspectRatio>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {objective.title}
                  </h3>
                  
                  {objective.excerpt && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {objective.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {objective.country?.name}
                      {objective.continent && `, ${objective.continent.name}`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {data.hasMore && (
        <div className="flex justify-center">
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