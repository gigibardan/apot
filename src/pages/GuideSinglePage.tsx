import { useState, useMemo } from "react";
import DOMPurify from "dompurify";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/seo/SEO";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GuideBookingForm } from "@/components/features/contact/GuideBookingForm";
import { getGuideBySlug } from "@/lib/supabase/queries/guides";
import { getGuideReviews } from "@/lib/supabase/queries/reviews";
import { canReviewGuide, getUserReview } from "@/lib/supabase/mutations/reviews";
import { generateGuideSchema } from "@/lib/utils/structured-data";
import { Star, Shield, MapPin, Languages, Mail, Phone, Globe, MessageCircle, Calendar, Send } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { ReviewForm } from "@/components/features/guides/ReviewForm";
import { ReviewList } from "@/components/features/guides/ReviewList";
import { useTranslatedGuide } from "@/hooks/useTranslatedContent";


export default function GuideSinglePage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const reviewsPerPage = 10;

  const { data: guideData, isLoading, error } = useQuery({
    queryKey: ["guide", slug],
    queryFn: () => getGuideBySlug(slug!),
    enabled: !!slug,
  });

  // Get translated content
  const { content: guide, isLoading: translationLoading } = useTranslatedGuide(guideData);

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ["guide-reviews", guide?.id, reviewsPage],
    queryFn: () => getGuideReviews(guide!.id, reviewsPerPage, (reviewsPage - 1) * reviewsPerPage),
    enabled: !!guide?.id,
  });

  const { data: canReview } = useQuery({
    queryKey: ["can-review-guide", guide?.id, user?.id],
    queryFn: () => canReviewGuide(guide!.id),
    enabled: !!guide?.id && isAuthenticated,
  });

  const { data: userReview, refetch: refetchUserReview } = useQuery({
    queryKey: ["user-review-guide", guide?.id, user?.id],
    queryFn: () => getUserReview(guide!.id),
    enabled: !!guide?.id && isAuthenticated,
  });

  if (isLoading || translationLoading) {
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

  const structuredData = generateGuideSchema(guide);

  return (
    <>
      <SEO
        title={guide.meta_title || `${guide.full_name} - Ghid Profesionist | APOT`}
        description={
          guide.meta_description ||
          guide.short_description ||
          `Descoperă serviciile ghidului ${guide.full_name}, expert în ${guide.specializations?.join(", ")}`
        }
        canonical={`/ghizi/${guide.slug}`}
        ogImage={guide.profile_image || undefined}
        structuredData={structuredData}
      />

      <div className="container mx-auto px-4 py-12">


        {/* Hero Section - REDESIGNED */}
        <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-8">
            {/* Coloana 1: Imagine Profil */}
            <div className="md:col-span-1 flex justify-center md:justify-start">
              {guide.profile_image ? (
                <img
                  src={guide.profile_image}
                  alt={guide.full_name}
                  className="w-56 h-56 md:w-full md:h-96 object-cover rounded-2xl shadow-xl ring-4 ring-white"
                />
              ) : (
                <div className="w-48 h-48 md:w-full md:h-96 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl ring-4 ring-white flex items-center justify-center">
                  <span className="text-6xl md:text-8xl font-bold text-white">
                    {guide.full_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Coloana 2-3: Informații */}
            <div className="md:col-span-2 space-y-4">
              {/* Nume + Rating */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {guide.full_name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(guide.rating_average)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-700">
                    {guide.rating_average.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({guide.reviews_count} {guide.reviews_count === 1 ? "recenzie" : "recenzii"})
                  </span>
                </div>
              </div>

              {/* Badges - În grid mobile-friendly */}
              <div className="flex flex-wrap gap-2">
                {guide.verified && (
                  <Badge variant="default" className="gap-1.5 px-3 py-1.5">
                    <Shield className="h-4 w-4" />
                    Verificat
                  </Badge>
                )}

                {guide.official_guide && guide.license_number && (
                  <Badge className="bg-green-600 hover:bg-green-700 text-white gap-1.5 px-3 py-1.5">
                    <Shield className="h-4 w-4" />
                    Licență SITUR #{guide.license_number}
                  </Badge>
                )}

                {guide.featured && (
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                    <Star className="h-4 w-4" />
                    Featured
                  </Badge>
                )}

                {guide.years_experience > 0 && (
                  <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
                    <Calendar className="h-4 w-4" />
                    {guide.years_experience} ani experiență
                  </Badge>
                )}
              </div>

              {/* Descriere scurtă */}
              {guide.short_description && (
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  {guide.short_description}
                </p>
              )}

              {/* Butoane Contact - Responsive */}
              <div className="flex flex-wrap gap-2 md:gap-3 pt-2">
                {guide.phone && (
                  <Button size="lg" className="flex-1 md:flex-initial gap-2" asChild>
                    <a href={`tel:${guide.phone}`}>
                      <Phone className="h-4 w-4" />
                      <span className="hidden sm:inline">Telefon</span>
                    </a>
                  </Button>
                )}

                {guide.whatsapp && (
                  <Button size="lg" variant="outline" className="flex-1 md:flex-initial gap-2" asChild>
                    <a
                      href={`https://wa.me/${guide.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  </Button>
                )}

                {guide.email && (
                  <Button size="lg" variant="outline" className="flex-1 md:flex-initial gap-2" asChild>
                    <a href={`mailto:${guide.email}`}>
                      <Mail className="h-4 w-4" />
                      <span className="hidden sm:inline">Email</span>
                    </a>
                  </Button>
                )}
              </div>

              {/* Info rapide - Pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {guide.languages && guide.languages.length > 0 && (
                  <div className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                    <Globe className="h-3.5 w-3.5" />
                    <span>{guide.languages.join(", ")}</span>
                  </div>
                )}

                {guide.geographical_areas && guide.geographical_areas.length > 0 && (
                  <div className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{guide.geographical_areas.slice(0, 2).join(", ")}</span>
                    {guide.geographical_areas.length > 2 && (
                      <span className="text-xs">+{guide.geographical_areas.length - 2}</span>
                    )}
                  </div>
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
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(guide.bio) }}
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

            {/* Review Form */}
            {isAuthenticated && canReview && !showReviewForm && !userReview && (
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    Ai călătorit cu {guide.full_name}? Lasă o recenzie!
                  </p>
                  <Button onClick={() => setShowReviewForm(true)}>Scrie o Recenzie</Button>
                </CardContent>
              </Card>
            )}

            {isAuthenticated && userReview && !showReviewForm && (
              <Card>
                <CardContent className="py-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Recenzia ta</h3>
                    <Button variant="outline" size="sm" onClick={() => setShowReviewForm(true)}>
                      Editează
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < userReview.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                  {userReview.title && <p className="font-medium mb-1">{userReview.title}</p>}
                  {userReview.comment && <p className="text-muted-foreground">{userReview.comment}</p>}
                  {!userReview.approved && (
                    <Badge variant="secondary" className="mt-2">
                      În așteptare de aprobare
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}

            {showReviewForm && (
              <ReviewForm
                guideId={guide.id}
                guideName={guide.full_name}
                existingReview={userReview || undefined}
                onSuccess={() => {
                  setShowReviewForm(false);
                  refetchReviews();
                  refetchUserReview();
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            )}

            {!isAuthenticated && (
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    Conectează-te pentru a lăsa o recenzie
                  </p>
                  <Button asChild>
                    <Link to="/auth/login">Conectare</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            {reviewsData && reviewsData.reviews && reviewsData.reviews.length > 0 && (
              <ReviewList
                reviews={reviewsData.reviews}
                totalCount={reviewsData.count || 0}
                currentPage={reviewsPage}
                pageSize={reviewsPerPage}
                onPageChange={setReviewsPage}
              />
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
