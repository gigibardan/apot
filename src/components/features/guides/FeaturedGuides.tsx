/**
 * Featured Guides Component
 * 
 * Displays a grid of featured verified guides on the homepage
 * Shows profile image, name, rating, specializations and geographical areas
 * Links to individual guide pages
 */

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFeaturedGuides } from "@/lib/supabase/queries/guides";
import { Star, Shield, MapPin, ArrowRight } from "lucide-react";
import { PUBLIC_ROUTES } from "@/lib/constants/routes";

interface FeaturedGuidesProps {
  limit?: number;
}

export function FeaturedGuides({ limit = 6 }: FeaturedGuidesProps) {
  const { data: guides, isLoading } = useQuery({
    queryKey: ["featured-guides", limit],
    queryFn: () => getFeaturedGuides(limit),
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 mb-4">
              <Shield className="h-3.5 w-3.5 mr-2" />
              Ghizi Verificați
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ghizii Noștri Profesioniști</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experți locali verificați care transformă călătoriile în experiențe memorabile
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(limit)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="w-20 h-20 bg-muted rounded-full mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!guides || guides.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 mb-4">
            <Shield className="h-3.5 w-3.5 mr-2" />
            Ghizi Verificați
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ghizii Noștri Profesioniști</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experți locali verificați care transformă călătoriile în experiențe memorabile
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {guides.map((guide) => (
            <Link key={guide.id} to={PUBLIC_ROUTES.guideDetail(guide.slug)}>
              <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 h-full">
                <div className="flex items-start gap-4 mb-4">
                  {guide.profile_image ? (
                    <img
                      src={guide.profile_image}
                      alt={guide.full_name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {guide.full_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{guide.full_name}</h3>
                      {guide.verified && (
                        <Badge variant="default" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Verificat
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{guide.rating_average.toFixed(1)}</span>
                      <span className="text-muted-foreground">({guide.reviews_count})</span>
                    </div>
                  </div>
                </div>

                {guide.short_description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {guide.short_description}
                  </p>
                )}

                <div className="space-y-2">
                  {guide.specializations && guide.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {guide.specializations.slice(0, 2).map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {guide.specializations.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{guide.specializations.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {guide.geographical_areas && guide.geographical_areas.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {guide.geographical_areas.slice(0, 2).join(", ")}
                        {guide.geographical_areas.length > 2 &&
                          ` +${guide.geographical_areas.length - 2}`}
                      </span>
                    </div>
                  )}

                  {guide.years_experience && (
                    <div className="text-sm font-medium text-primary">
                      {guide.years_experience} ani experiență
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" asChild>
            <Link to={PUBLIC_ROUTES.guides}>
              Vezi Toți Ghizii
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
