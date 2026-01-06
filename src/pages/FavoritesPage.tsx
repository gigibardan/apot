import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MapPin } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getUserFavorites } from "@/lib/supabase/queries/favorites";
import { FavoriteButton } from "@/components/features/objectives/FavoriteButton";

// Helper to extract first item if array
function getObjective(objectives: any) {
  if (!objectives) return null;
  if (Array.isArray(objectives)) return objectives[0] || null;
  return objectives;
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading: loading } = useQuery({
    queryKey: ["userFavorites"],
    queryFn: getUserFavorites,
    enabled: !!user,
  });

  const handleRemoveFavorite = () => {
    queryClient.invalidateQueries({ queryKey: ["userFavorites"] });
    queryClient.invalidateQueries({ queryKey: ["favoritesCount"] });
  };

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Section className="pt-24 pb-16">
        <Container>
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Autentificare necesară</h2>
            <p className="text-muted-foreground mb-6">
              Trebuie să fii autentificat pentru a vedea favoritele tale.
            </p>
            <Button onClick={() => navigate("/auth/login")}>
              Conectează-te
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Obiectivele Mele Favorite | JInfo</title>
        <meta
          name="description"
          content="Explorează și gestionează lista ta de obiective turistice favorite din întreaga lume."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Section className="pt-24 pb-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Heart className="h-8 w-8 text-destructive fill-current" />
              <div>
                <h1 className="text-4xl font-bold">Obiectivele Mele Favorite</h1>
                <p className="text-muted-foreground mt-2">
                  {favorites.length} {favorites.length === 1 ? "obiectiv salvat" : "obiective salvate"}
                </p>
              </div>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">Niciun obiectiv favorit</h2>
                <p className="text-muted-foreground mb-6">
                  Începe să explorezi obiective turistice și salvează-le ca favorite pentru a le găsi mai ușor mai târziu.
                </p>
                <Button onClick={() => navigate("/obiective")}>
                  Explorează Obiective
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {favorites.map((favorite: any) => {
                  const objective = getObjective(favorite.objectives);
                  if (!objective) return null;
                  
                  const country = Array.isArray(objective.countries) ? objective.countries[0] : objective.countries;
                  const continent = Array.isArray(objective.continents) ? objective.continents[0] : objective.continents;

                  return (
                    <Card
                      key={favorite.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => navigate(`/obiective/${objective.slug}`)}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                          {/* Image */}
                          <div className="relative w-full sm:w-64 h-48 flex-shrink-0 overflow-hidden rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none">
                            <img
                              src={objective.featured_image || "/placeholder.svg"}
                              alt={objective.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                              <FavoriteButton
                                objectiveId={objective.id}
                                variant="ghost"
                                className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                              />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-4 sm:py-6 sm:pr-6 sm:pl-0">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <h2 className="text-xl sm:text-2xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                                {objective.title}
                              </h2>
                            </div>

                            {/* Location */}
                            {country && continent && (
                              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span className="text-sm">
                                  {country.flag_emoji}{" "}
                                  {country.name},{" "}
                                  {continent.name}
                                </span>
                              </div>
                            )}

                            {/* Excerpt */}
                            <p className="text-muted-foreground mb-4 line-clamp-2 text-sm sm:text-base">
                              {objective.excerpt}
                            </p>

                            {/* Stats */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                              <Badge variant="secondary">
                                {objective.views_count || 0} vizualizări
                              </Badge>
                              <span className="text-xs sm:text-sm">
                                Salvat la{" "}
                                {new Date(favorite.created_at).toLocaleDateString("ro-RO", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
