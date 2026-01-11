import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Eye, MapPin, User, ArrowLeft, Share2 } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getJournalBySlug } from "@/lib/supabase/queries/journals";
import { getJournalComments } from "@/lib/supabase/queries/journal-comments";
import { isJournalLiked } from "@/lib/supabase/queries/journals";
import { JournalLikeButton } from "@/components/features/journals/JournalLikeButton";
import { JournalComments } from "@/components/features/journals/JournalComments";
import { FollowButton } from "@/components/features/social/FollowButton";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import DOMPurify from "dompurify";

export default function JournalSingle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);

  // Fetch journal data
  const {
    data: journal,
    isLoading,
    error,
    refetch: refetchJournal,
  } = useQuery({
    queryKey: ["journal", slug],
    queryFn: () => getJournalBySlug(slug!),
    enabled: !!slug,
  });

  // Fetch comments
  const {
    data: comments = [],
    refetch: refetchComments,
  } = useQuery({
    queryKey: ["journal-comments", journal?.id],
    queryFn: () => getJournalComments(journal!.id),
    enabled: !!journal?.id,
  });

  // Check if user liked this journal
  useEffect(() => {
    if (journal?.id) {
      isJournalLiked(journal.id).then(setLiked).catch(console.error);
    }
  }, [journal?.id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: journal?.title,
          text: journal?.excerpt || "",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: Copy link to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiat!",
        description: "Link-ul jurnalului a fost copiat în clipboard.",
      });
    }
  };

  const formatTripDates = () => {
    if (!journal?.trip_start_date) return null;

    const start = format(new Date(journal.trip_start_date), "d MMM yyyy", {
      locale: ro,
    });

    if (journal.trip_end_date) {
      const end = format(new Date(journal.trip_end_date), "d MMM yyyy", {
        locale: ro,
      });
      return `${start} - ${end}`;
    }

    return start;
  };

  const getUserInitials = () => {
    return journal?.user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";
  };

  // Sanitize HTML content to prevent XSS
  const sanitizedContent = useMemo(() => {
    if (!journal?.content) return "";
    return DOMPurify.sanitize(journal.content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'blockquote', 'img', 'div', 'span'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class'],
      ALLOW_DATA_ATTR: false
    });
  }, [journal?.content]);

  if (isLoading) {
    return (
      <>
        <SEO title="Se încarcă..." noindex />
        <Container className="py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-64 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </Container>
      </>
    );
  }

  if (error || !journal) {
    return (
      <>
        <SEO title="Jurnal negăsit" noindex />
        <Container className="py-12">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Jurnal negăsit</h1>
            <p className="text-muted-foreground">
              Jurnalul pe care îl cauți nu există sau nu este disponibil.
            </p>
            <Button onClick={() => navigate("/journals")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Înapoi la Jurnale
            </Button>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <SEO
        title={journal.meta_title || journal.title}
        description={journal.meta_description || journal.excerpt || ""}
        ogImage={journal.cover_image || undefined}
        canonical={`/journals/${journal.slug}`}
      />

      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-6"
            onClick={() => navigate("/journals")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Înapoi la Jurnale
          </Button>

          {/* Header */}
          <div className="space-y-6">
            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold">{journal.title}</h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {formatTripDates() && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatTripDates()}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{journal.views_count || 0} vizualizări</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(journal.created_at), "d MMM yyyy", {
                    locale: ro,
                  })}
                </span>
              </div>
            </div>

            {/* Author Card */}
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={journal.user?.avatar_url || undefined} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      to={`/user/${journal.user?.username || journal.user_id}`}
                      className="font-medium text-lg hover:underline"
                    >
                      {journal.user?.full_name}
                    </Link>
                    {journal.user?.bio && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {journal.user.bio}
                      </p>
                    )}
                  </div>
                </div>

                <FollowButton
                  userId={journal.user_id}
                  size="default"
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <JournalLikeButton
                journalId={journal.id}
                initialLiked={liked}
                initialCount={journal.likes_count || 0}
                onLikeChange={(liked, count) => {
                  setLiked(liked);
                  refetchJournal();
                }}
              />

              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Distribuie
              </Button>
            </div>

            {/* Cover Image */}
            {journal.cover_image && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <img
                  src={journal.cover_image}
                  alt={journal.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Excerpt */}
            {journal.excerpt && (
              <div className="text-lg text-muted-foreground border-l-4 border-primary pl-4">
                {journal.excerpt}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
            </div>

            {/* Gallery */}
            {journal.gallery_images &&
              Array.isArray(journal.gallery_images) &&
              journal.gallery_images.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold">Galerie Foto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {journal.gallery_images.map((image: any, index: number) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-lg overflow-hidden"
                      >
                        <img
                          src={image.url || image}
                          alt={`Galerie ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Visited Objectives */}
            {journal.visited_objectives &&
              journal.visited_objectives.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold flex items-center gap-2">
                    <MapPin className="h-6 w-6" />
                    Obiective Vizitate
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {journal.visited_objectives.map((objectiveId) => (
                      <Badge key={objectiveId} variant="secondary">
                        <Link
                          to={`/obiective/${objectiveId}`}
                          className="hover:underline"
                        >
                          Vezi obiectiv
                        </Link>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {/* Comments Section */}
            <div className="pt-8">
              <JournalComments
                journalId={journal.id}
                comments={comments}
                onCommentAdded={() => {
                  refetchComments();
                  refetchJournal();
                }}
              />
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}