import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/seo/SEO";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGuideBySlug } from "@/lib/supabase/queries/guides";
import { Star, Shield, MapPin, Languages, Mail, Phone, Globe, MessageCircle, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";

export default function GuideSinglePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: guide, isLoading, error } = useQuery({
    queryKey: ["guide", slug],
    queryFn: () => getGuideBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !guide) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Ghidul nu a fost găsit</h1>
        <Button asChild>
          <Link to="/ghizi">Vezi toți ghizii</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={guide.meta_title || `${guide.full_name} - Ghid Profesionist | APOT`}
        description={
          guide.meta_description ||
          guide.short_description ||
          `Descoperă serviciile ghidului ${guide.full_name}, expert în ${guide.specializations?.join(", ")}`
        }
      />

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-1">
            {guide.profile_image ? (
              <img
                src={guide.profile_image}
                alt={guide.full_name}
                className="w-full aspect-square object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full aspect-square bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-6xl font-bold text-primary">
                  {guide.full_name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{guide.full_name}</h1>
                {guide.verified && (
                  <Badge variant="default" className="text-base px-3 py-1">
                    <Shield className="h-4 w-4 mr-1" />
                    Verificat
                  </Badge>
                )}
                {guide.featured && (
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    <Star className="h-4 w-4 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(guide.rating_average)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{guide.rating_average.toFixed(1)}</span>
                <span className="text-muted-foreground">({guide.reviews_count} recenzii)</span>
              </div>

              {guide.short_description && (
                <p className="text-lg text-muted-foreground mb-6">{guide.short_description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                {guide.years_experience && (
                  <div>
                    <div className="text-sm text-muted-foreground">Experiență</div>
                    <div className="text-lg font-semibold">{guide.years_experience} ani</div>
                  </div>
                )}
                {guide.geographical_areas && guide.geographical_areas.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground">Zone</div>
                    <div className="text-lg font-semibold">{guide.geographical_areas.length} regiuni</div>
                  </div>
                )}
              </div>

              {/* Contact Buttons */}
              <div className="flex flex-wrap gap-3">
                {guide.email && (
                  <Button asChild>
                    <a href={`mailto:${guide.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </a>
                  </Button>
                )}
                {guide.phone && (
                  <Button variant="outline" asChild>
                    <a href={`tel:${guide.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Telefon
                    </a>
                  </Button>
                )}
                {guide.whatsapp && (
                  <Button variant="outline" asChild>
                    <a
                      href={`https://wa.me/${guide.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                )}
                {guide.website_url && (
                  <Button variant="outline" asChild>
                    <a href={guide.website_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
                {guide.availability_calendar_url && (
                  <Button variant="outline" asChild>
                    <a
                      href={guide.availability_calendar_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Disponibilitate
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Biography */}
            {guide.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>Despre Mine</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: guide.bio }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Expert Objectives */}
            {guide.objectives && guide.objectives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Obiective Expert</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guide.objectives.map((rel: any) => {
                      const objective = rel.objective;
                      return (
                        <Link
                          key={objective.id}
                          to={`/obiective/${objective.slug}`}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
                        >
                          {objective.featured_image && (
                            <img
                              src={objective.featured_image}
                              alt={objective.title}
                              className="w-16 h-16 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{objective.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {objective.location_text}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {guide.reviews && guide.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recenzii ({guide.reviews_count})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {guide.reviews.map((review: any) => (
                    <div key={review.id}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-semibold">{review.user?.full_name}</span>
                          </div>
                          {review.title && (
                            <div className="font-medium mb-1">{review.title}</div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(review.created_at)}
                        </div>
                      </div>
                      {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                      {review.travel_date && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Călătorie: {formatDate(review.travel_date)}
                        </div>
                      )}
                      {review.guide_response && (
                        <div className="mt-3 ml-6 p-3 bg-muted rounded-lg">
                          <div className="font-semibold text-sm mb-1">Răspuns de la ghid:</div>
                          <p className="text-sm">{review.guide_response}</p>
                        </div>
                      )}
                      <Separator className="mt-6" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            {(guide.price_per_day || guide.price_per_group) && (
              <Card>
                <CardHeader>
                  <CardTitle>Tarife</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {guide.price_per_day && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Per Zi</span>
                      <span className="text-2xl font-bold">{guide.price_per_day} €</span>
                    </div>
                  )}
                  {guide.price_per_group && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Per Grup</span>
                      <span className="text-2xl font-bold">{guide.price_per_group} €</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    * Tarifele pot varia în funcție de sezon și durată
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {guide.languages && guide.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Limbi Vorbite</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {guide.languages.map((lang) => (
                      <Badge key={lang} variant="secondary">
                        <Languages className="h-3 w-3 mr-1" />
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Specializations */}
            {guide.specializations && guide.specializations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Specializări</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {guide.specializations.map((spec) => (
                      <Badge key={spec} variant="outline">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Geographical Areas */}
            {guide.geographical_areas && guide.geographical_areas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Zone Geografice</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {guide.geographical_areas.map((area) => (
                      <div key={area} className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="mt-12 bg-primary text-primary-foreground">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Contactează-l pe {guide.full_name}</h2>
            <p className="text-lg mb-6 opacity-90">
              Pentru o experiență de călătorie autentică și memorabilă
            </p>
            <div className="flex justify-center gap-4">
              {guide.email && (
                <Button size="lg" variant="secondary" asChild>
                  <a href={`mailto:${guide.email}`}>
                    <Mail className="h-5 w-5 mr-2" />
                    Trimite Email
                  </a>
                </Button>
              )}
              {guide.phone && (
                <Button size="lg" variant="secondary" asChild>
                  <a href={`tel:${guide.phone}`}>
                    <Phone className="h-5 w-5 mr-2" />
                    Sună Acum
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
