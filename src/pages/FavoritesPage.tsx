import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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

interface Favorite {
  id: string;
  created_at: string;
  objectives: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string;
    location_text: string;
    continents: { name: string; slug: string } | null;
    countries: { name: string; slug: string; flag_emoji: string } | null;
    views_count: number;
    likes_count: number;
  } | null;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
      return;
    }

    loadFavorites();
  }, [user, navigate]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await getUserFavorites();
      // Type assertion for Supabase data structure
      setFavorites(data as any);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = () => {
    // Reload favorites after removal
    loadFavorites();
  };

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
                {favorites.map((favorite) => (
                  <Card
                    key={favorite.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => favorite.objectives && navigate(`/obiective/${favorite.objectives.slug}`)}
                  >
                    <CardContent className="p-0">
                      <div className="flex gap-6">
                        {/* Image */}
                        {favorite.objectives && (
                          <>
                            <div className="relative w-64 h-48 flex-shrink-0 overflow-hidden rounded-l-lg">
                              <img
                                src={favorite.objectives.featured_image}
                                alt={favorite.objectives.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-3 right-3">
                                <FavoriteButton
                                  objectiveId={favorite.objectives.id}
                                  variant="ghost"
                                  className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                                />
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 py-6 pr-6">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">
                                  {favorite.objectives.title}
                                </h2>
                              </div>

                              {/* Location */}
                              {favorite.objectives.countries && favorite.objectives.continents && (
                                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                  <MapPin className="h-4 w-4" />
                                  <span className="text-sm">
                                    {favorite.objectives.countries.flag_emoji}{" "}
                                    {favorite.objectives.countries.name},{" "}
                                    {favorite.objectives.continents.name}
                                  </span>
                                </div>
                              )}

                              {/* Excerpt */}
                              <p className="text-muted-foreground mb-4 line-clamp-2">
                                {favorite.objectives.excerpt}
                              </p>

                              {/* Stats */}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <Badge variant="secondary">
                                  {favorite.objectives.views_count} vizualizări
                                </Badge>
                                <span>
                                  Salvat la{" "}
                                  {new Date(favorite.created_at).toLocaleDateString("ro-RO", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
