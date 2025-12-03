import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/features/objectives/Breadcrumbs";
import { ObjectiveSidebar } from "@/components/features/objectives/ObjectiveSidebar";
import { ObjectiveCard } from "@/components/features/objectives/ObjectiveCard";
import { ObjectiveGallery } from "@/components/features/objectives/ObjectiveGallery";
import { ObjectiveMap } from "@/components/features/objectives/ObjectiveMap";
import { ObjectiveReviewForm } from "@/components/features/objectives/ObjectiveReviewForm";
import { ObjectiveReviewList } from "@/components/features/objectives/ObjectiveReviewList";
import { ObjectiveReviewStats } from "@/components/features/objectives/ObjectiveReviewStats";
import { FavoriteButton } from "@/components/features/objectives/FavoriteButton";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { ReadingProgress } from "@/components/shared/ReadingProgress";
import { MobileStickyCTA } from "@/components/shared/MobileStickyCTA";
import { ObjectiveInquiryForm } from "@/components/features/contact/ObjectiveInquiryForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  getObjectiveBySlug,
  incrementObjectiveViews,
  getSimilarObjectives,
} from "@/lib/supabase/queries/objectives";
import {
  getObjectiveReviews,
  getUserObjectiveReview,
  getObjectiveReviewStats,
} from "@/lib/supabase/queries/objective-reviews";
import { useAuth } from "@/contexts/AuthContext";
import { ShareButtons } from "@/components/features/objectives/ShareButtons";
import { generateObjectiveSchema, generateBreadcrumbSchema } from "@/lib/utils/structured-data";
import type { ObjectiveWithRelations } from "@/types/database.types";
import { Clock, Calendar, DollarSign, Clock3, Accessibility, Award, MapPin, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslatedObjective } from "@/hooks/useTranslatedContent";

export default function ObjectiveSingle() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [objectiveData, setObjectiveData] = useState<ObjectiveWithRelations | null>(null);
  const [similar, setSimilar] = useState<ObjectiveWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get translated content
  const { content: objective, isLoading: translationLoading } = useTranslatedObjective(objectiveData);
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [userReview, setUserReview] = useState<any>(null);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [totalReviewsPages, setTotalReviewsPages] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showInquiryDialog, setShowInquiryDialog] = useState(false);

  // Fetch objective data
  useEffect(() => {
    const fetchObjective = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const data = await getObjectiveBySlug(slug);
        setObjectiveData(data);

        // Increment views (fire and forget)
        incrementObjectiveViews(data.id).catch(console.error);

        // Fetch similar objectives
        const similarData = await getSimilarObjectives(data.id, 3);
        setSimilar(similarData);

        // Fetch reviews data
        const [reviewsData, statsData, userReviewData] = await Promise.all([
          getObjectiveReviews(data.id, reviewsPage),
          getObjectiveReviewStats(data.id),
          user ? getUserObjectiveReview(data.id) : Promise.resolve(null),
        ]);

        setReviews(reviewsData.reviews);
        setTotalReviewsPages(reviewsData.pages);
        setReviewStats(statsData);
        setUserReview(userReviewData);
      } catch (err: any) {
        if (err.message?.includes("No rows")) {
          setNotFound(true);
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchObjective();
  }, [slug, reviewsPage, user]);

  // Handle review page change
  const handleReviewPageChange = (page: number) => {
    setReviewsPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle review success
  const handleReviewSuccess = async () => {
    if (!objective) return;
    setShowReviewForm(false);
    
    // Refresh reviews
    const [reviewsData, statsData, userReviewData] = await Promise.all([
      getObjectiveReviews(objective.id, reviewsPage),
      getObjectiveReviewStats(objective.id),
      user ? getUserObjectiveReview(objective.id) : Promise.resolve(null),
    ]);

    setReviews(reviewsData.reviews);
    setTotalReviewsPages(reviewsData.pages);
    setReviewStats(statsData);
    setUserReview(userReviewData);
  };

  // Generate breadcrumbs
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [{ label: "Obiective Turistice", href: "/obiective" }];

    if (objective?.continent) {
      items.push({
        label: objective.continent.name,
        href: `/obiective?continent=${objective.continent.slug}`,
      });
    }

    if (objective?.country) {
      items.push({
        label: objective.country.name,
        href: `/obiective?country=${objective.country.slug}`,
      });
    }

    if (objective) {
      const title = objective.title.length > 40 ? `${objective.title.slice(0, 40)}...` : objective.title;
      items.push({ label: title });
    }

    return items;
  };

  // SEO data
  const getPageTitle = () => {
    if (!objective) return "Obiectiv Turistic";
    return `${objective.title} - ${objective.country?.name || ""}`;
  };

  const getPageDescription = () => {
    return objective?.excerpt || objective?.description?.slice(0, 160) || "";
  };

  const getStructuredData = () => {
    if (!objective) return undefined;

    const breadcrumbs = getBreadcrumbs();
    const breadcrumbItems = breadcrumbs.map((item) => ({
      name: item.label,
      url: item.href,
    }));

    return {
      "@context": "https://schema.org",
      "@graph": [
        generateObjectiveSchema(objective),
        generateBreadcrumbSchema(breadcrumbItems),
      ],
    };
  };

  // Sanitize HTML description to prevent XSS attacks
  const sanitizedDescription = useMemo(() => {
    if (!objective?.description) return null;
    return DOMPurify.sanitize(objective.description, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'blockquote'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    });
  }, [objective?.description]);

  // Loading State
  if (loading || translationLoading) {
    return (
      <>
        <SEO title="Se încarcă..." />
        <Section className="py-8">
          <Container>
            <Skeleton className="h-6 w-2/3 mb-6" />
            <Skeleton className="h-[60vh] w-full mb-8" />
            <div className="grid lg:grid-cols-[1fr_350px] gap-8">
              <div className="space-y-8">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-60 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-60 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          </Container>
        </Section>
      </>
    );
  }

  // Not Found State
  if (notFound) {
    return (
      <>
        <SEO title="Obiectiv Negăsit" noindex />
        <Section className="py-16">
          <Container>
            <EmptyState
              icon="🗺️"
              title="Obiectivul nu a fost găsit"
              description="Ne pare rău, dar acest obiectiv nu există sau a fost mutat."
              action={{
                label: "Explorează Obiective",
                href: "/obiective",
              }}
            />
          </Container>
        </Section>
      </>
    );
  }

  // Error State
  if (error || !objective) {
    return (
      <>
        <SEO title="Eroare" noindex />
        <Section className="py-16">
          <Container>
            <EmptyState
              icon="❌"
              title="Nu am putut încărca obiectivul"
              description="A apărut o eroare la încărcarea datelor. Te rugăm să încerci din nou."
              action={{
                label: "Încearcă din nou",
                onClick: () => window.location.reload(),
              }}
            />
          </Container>
        </Section>
      </>
    );
  }

  // Success State
  return (
    <>
      <SEO
        title={getPageTitle()}
        description={getPageDescription()}
        canonical={`/obiective/${objective.slug}`}
        ogImage={objective.featured_image || undefined}
        ogType="website"
        structuredData={getStructuredData()}
      />

      {/* Reading Progress Bar */}
      <ReadingProgress />

      {/* Mobile Sticky CTA */}
      {objective.country && <MobileStickyCTA countryName={objective.country.name} />}

      {/* Breadcrumbs */}
      <Section className="!py-4 md:!py-8 bg-muted/30">
        <Container>
          <Breadcrumbs items={getBreadcrumbs()} />
        </Container>
      </Section>

      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[70vh] lg:h-[60vh] overflow-hidden">
        {objective.featured_image ? (
          <img
            src={objective.featured_image}
            alt={objective.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 pb-8 md:pb-12">
          <Container>
            <div className="space-y-4">
              {/* Location */}
              {objective.country && (
                <p className="text-white/90 text-lg md:text-xl flex items-center gap-2" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                  <span className="text-2xl">{objective.country.flag_emoji || "🌍"}</span>
                  <span>
                    {objective.country.name}
                    {objective.continent && ` | ${objective.continent.name}`}
                  </span>
                </p>
              )}

              {/* Title */}
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
              >
                {objective.title}
              </h1>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {objective.unesco_site && (
                  <Badge className="bg-yellow-500 dark:bg-yellow-600 text-white border-0">
                    <Award className="w-4 h-4 mr-1" />
                    UNESCO
                  </Badge>
                )}
                {objective.types?.slice(0, 3).map((rel: any) => (
                  <Badge
                    key={rel.type.id}
                    className="bg-background/90 backdrop-blur-sm"
                    style={{
                      backgroundColor: rel.type.color ? `${rel.type.color}20` : undefined,
                      color: rel.type.color || undefined,
                    }}
                  >
                    {rel.type.icon && <span className="mr-1">{rel.type.icon}</span>}
                    {rel.type.name}
                  </Badge>
                ))}
                {objective.types && objective.types.length > 3 && (
                  <Badge variant="secondary">+{objective.types.length - 3} mai mult</Badge>
                )}
              </div>
            </div>
          </Container>
        </div>
      </section>

      {/* Main Content */}
      <Section className="py-12">
        <Container>
          <div className="grid lg:grid-cols-[1fr_350px] gap-8">
            {/* Main Content Area */}
            <div className="space-y-12">
              {/* About Section */}
              <article>
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">
                  Despre {objective.title}
                </h2>
                {sanitizedDescription ? (
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                  />
                ) : objective.excerpt ? (
                  <p className="text-lg text-muted-foreground leading-relaxed">{objective.excerpt}</p>
                ) : (
                  <p className="text-muted-foreground">Descrierea va fi adăugată în curând.</p>
                )}
              </article>

              {/* Practical Information */}
              {(objective.visit_duration ||
                objective.best_season ||
                objective.entrance_fee ||
                objective.opening_hours ||
                objective.accessibility_info ||
                objective.difficulty_level) && (
                <section>
                  <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">
                    Informații Practice
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {objective.visit_duration && (
                      <InfoCard icon={Clock} label="Durată Vizită" value={objective.visit_duration} />
                    )}
                    {objective.best_season && (
                      <InfoCard icon={Calendar} label="Sezon Recomandat" value={objective.best_season} />
                    )}
                    {objective.entrance_fee && (
                      <InfoCard icon={DollarSign} label="Tarif Intrare" value={objective.entrance_fee} />
                    )}
                    {objective.opening_hours && (
                      <InfoCard icon={Clock3} label="Program" value={objective.opening_hours} />
                    )}
                    {objective.accessibility_info && (
                      <InfoCard icon={Accessibility} label="Accesibilitate" value={objective.accessibility_info} />
                    )}
                  </div>
                </section>
              )}

              {/* Contact & Links */}
              <section>
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">
                  Contact & Rezervări
                </h2>
                <div className="flex flex-wrap gap-3">
                  <Dialog open={showInquiryDialog} onOpenChange={setShowInquiryDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Pune o întrebare
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Întreabă despre {objective.title}</DialogTitle>
                      </DialogHeader>
                      <ObjectiveInquiryForm
                        objectiveId={objective.id}
                        objectiveTitle={objective.title}
                        onSuccess={() => setShowInquiryDialog(false)}
                      />
                    </DialogContent>
                  </Dialog>
                  
                  {objective.website_url && (
                    <Button asChild variant="outline">
                      <a href={objective.website_url} target="_blank" rel="noopener noreferrer">
                        🌐 Website
                      </a>
                    </Button>
                  )}
                  {objective.contact_email && (
                    <Button asChild variant="outline">
                      <a href={`mailto:${objective.contact_email}`}>📧 Email</a>
                    </Button>
                  )}
                  {objective.contact_phone && (
                    <Button asChild variant="outline">
                      <a href={`tel:${objective.contact_phone}`}>📞 Telefon</a>
                    </Button>
                  )}
                  {objective.booking_url && (
                    <Button asChild variant="outline">
                      <a href={objective.booking_url} target="_blank" rel="noopener noreferrer">
                        🎟️ Rezervă Acum
                      </a>
                    </Button>
                  )}
                </div>
              </section>

              {/* Gallery Section */}
              <section>
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">Galerie Foto</h2>
                <ObjectiveGallery
                  images={
                    objective.gallery_images && objective.gallery_images.length > 0
                      ? objective.gallery_images
                      : objective.featured_image
                      ? [{ url: objective.featured_image, alt: objective.title }]
                      : []
                  }
                  objectiveTitle={objective.title}
                />
              </section>

              {/* Location Section */}
              <section>
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">Locație</h2>
                {objective.latitude && objective.longitude ? (
                  <ObjectiveMap
                    latitude={objective.latitude}
                    longitude={objective.longitude}
                    title={objective.title}
                    locationText={objective.location_text || undefined}
                  />
                ) : (
                  <div className="space-y-4">
                    {objective.location_text && (
                      <p className="text-muted-foreground">{objective.location_text}</p>
                    )}
                    <div className="bg-muted/50 rounded-lg p-12 text-center">
                      <p className="text-muted-foreground">
                        Coordonatele GPS vor fi adăugate în curând
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* Reviews Section */}
              <section>
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">
                  Recenzii
                </h2>

                <div className="space-y-8">
                  {/* Review Stats */}
                  {reviewStats && <ObjectiveReviewStats stats={reviewStats} />}

                  {/* Review Form */}
                  {user && !userReview && !showReviewForm && (
                    <Button onClick={() => setShowReviewForm(true)} size="lg" className="w-full">
                      Scrie o Recenzie
                    </Button>
                  )}

                  {user && userReview && !showReviewForm && (
                    <div className="flex gap-3">
                      <Button onClick={() => setShowReviewForm(true)} variant="outline" className="flex-1">
                        Editează Recenzia Ta
                      </Button>
                    </div>
                  )}

                  {showReviewForm && objective && (
                    <ObjectiveReviewForm
                      objectiveId={objective.id}
                      objectiveTitle={objective.title}
                      existingReview={userReview || undefined}
                      onSuccess={handleReviewSuccess}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  )}

                  {!user && !showReviewForm && (
                    <Card className="p-6 text-center">
                      <p className="text-muted-foreground mb-4">
                        Trebuie să fii autentificat pentru a lăsa o recenzie
                      </p>
                      <Button asChild>
                        <Link to="/auth/login">Autentificare</Link>
                      </Button>
                    </Card>
                  )}

                  {/* Reviews List */}
                  <ObjectiveReviewList
                    reviews={reviews}
                    totalReviews={reviewStats?.totalReviews || 0}
                    currentPage={reviewsPage}
                    totalPages={totalReviewsPages}
                    onPageChange={handleReviewPageChange}
                  />
                </div>
              </section>

              {/* Similar Objectives */}
              {similar.length > 0 && (
                <section>
                  <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">
                    Obiective Similare
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {similar.map((obj) => (
                      <ObjectiveCard key={obj.id} objective={obj} showExcerpt={false} />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-20 self-start space-y-6">
              <ObjectiveSidebar objective={objective} />
            </aside>
          </div>
        </Container>
      </Section>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </>
  );
}

// Info Card Component
function InfoCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
      <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
