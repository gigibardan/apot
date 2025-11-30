import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Heart, Search, Trash2, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface DashboardFavoritesProps {
  userId: string;
  limit?: number;
  compact?: boolean;
}

export function DashboardFavorites({ userId, limit, compact = false }: DashboardFavoritesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");

  // Fetch favorites
  const { data: favorites, isLoading } = useQuery({
    queryKey: ["user-favorites", userId, limit],
    queryFn: async () => {
      let query = supabase
        .from("user_favorites")
        .select(
          `
          id,
          created_at,
          objective:objectives (
            id,
            title,
            slug,
            excerpt,
            featured_image,
            location_text,
            country:countries (
              name,
              flag_emoji
            )
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

  // Delete favorite mutation
  const deleteFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: string) => {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("id", favoriteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats", userId] });
      toast({
        title: "Favorit șters",
        description: "Obiectivul a fost eliminat din favorite",
      });
    },
    onError: (error) => {
      toast({
        title: "Eroare",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter and sort favorites
  const filteredFavorites = favorites
    ?.filter((fav) => {
      if (!search) return true;
      const objective = fav.objective as any;
      return (
        objective?.title?.toLowerCase().includes(search.toLowerCase()) ||
        objective?.location_text?.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      const objA = a.objective as any;
      const objB = b.objective as any;

      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        return objA?.title?.localeCompare(objB?.title);
      }
    });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(limit || 3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    if (compact) {
      return (
        <p className="text-sm text-muted-foreground text-center py-8">
          Niciun favorit încă
        </p>
      );
    }

    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={<Heart className="w-12 h-12" />}
            title="Niciun favorit"
            description="Nu ai adăugat încă niciun obiectiv la favorite"
            action={{
              label: "Explorează Obiective",
              href: "/obiective",
            }}
          />
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {filteredFavorites?.slice(0, limit).map((favorite) => {
          const objective = favorite.objective as any;
          return (
            <Link
              key={favorite.id}
              to={`/obiective/${objective.slug}`}
              className="flex gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              {objective.featured_image && (
                <img
                  src={objective.featured_image}
                  alt={objective.title}
                  className="w-16 h-16 rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{objective.title}</p>
                {objective.location_text && (
                  <p className="text-sm text-muted-foreground truncate">
                    {objective.location_text}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
        {!limit && (
          <Button variant="outline" className="w-full" asChild>
            <Link to="/dashboard?tab=favorites">Vezi Toate</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Obiectivele Mele Favorite</CardTitle>
        <CardDescription>
          {filteredFavorites?.length} obiective salvate
        </CardDescription>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută în favorite..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Cele mai noi</SelectItem>
              <SelectItem value="oldest">Cele mai vechi</SelectItem>
              <SelectItem value="name">Nume (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {filteredFavorites?.map((favorite) => {
            const objective = favorite.objective as any;
            return (
              <div
                key={favorite.id}
                className="flex gap-4 p-4 rounded-lg border hover:border-primary transition-colors"
              >
                <Link to={`/obiective/${objective.slug}`} className="flex-shrink-0">
                  {objective.featured_image ? (
                    <img
                      src={objective.featured_image}
                      alt={objective.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/obiective/${objective.slug}`}>
                    <h3 className="font-semibold hover:text-primary transition-colors">
                      {objective.title}
                    </h3>
                  </Link>
                  
                  {objective.location_text && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {objective.country?.flag_emoji} {objective.location_text}
                    </p>
                  )}

                  {objective.excerpt && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {objective.excerpt}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground mt-2">
                    Adăugat {format(new Date(favorite.created_at), "d MMM yyyy", { locale: ro })}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteFavoriteMutation.mutate(favorite.id)}
                  disabled={deleteFavoriteMutation.isPending}
                  className="flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
