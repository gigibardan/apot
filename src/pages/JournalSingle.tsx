import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJournalBySlug } from "@/lib/supabase/queries/journals";
import { toggleJournalLike } from "@/lib/supabase/mutations/journals";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/seo/SEO";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ShareButtons } from "@/components/features/objectives/ShareButtons";
import { FollowButton } from "@/components/features/social/FollowButton";
import { Heart, Calendar, Eye, User, MapPin } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import DOMPurify from "dompurify";

export default function JournalSingle() {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: journal, isLoading } = useQuery({
    queryKey: ["journal", slug],
    queryFn: () => getJournalBySlug(slug!),
  });

  const likeMutation = useMutation({
    mutationFn: () => toggleJournalLike(journal!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal", slug] });
      toast.success("Updated!");
    },
    onError: () => {
      toast.error("Failed to update like");
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!journal) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Journal not found</h2>
        <Link to="/journals">
          <Button>Back to Journals</Button>
        </Link>
      </div>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(journal.content || "");

  return (
    <>
      <SEO
        title={journal.title}
        description={journal.excerpt || "Travel journal"}
        ogImage={journal.cover_image}
      />

      <div className="container py-8 max-w-4xl">
        {/* Cover Image */}
        {journal.cover_image && (
          <div className="aspect-[21/9] overflow-hidden rounded-lg mb-8">
            <img
              src={journal.cover_image}
              alt={journal.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title & Meta */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{journal.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(journal.published_at), "MMM dd, yyyy")}
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {journal.views_count || 0} views
            </div>
            {journal.trip_start_date && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Trip: {format(new Date(journal.trip_start_date), "MMM yyyy")}
                {journal.trip_end_date && ` - ${format(new Date(journal.trip_end_date), "MMM yyyy")}`}
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-between border-y py-4">
            <Link 
              to={`/profil/${journal.user?.username || journal.user_id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar>
                <AvatarImage src={journal.user?.avatar_url} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{journal.user?.full_name}</p>
                {journal.user?.username && (
                  <p className="text-sm text-muted-foreground">@{journal.user.username}</p>
                )}
              </div>
            </Link>
            {user && user.id !== journal.user_id && (
              <FollowButton userId={journal.user_id} size="sm" />
            )}
          </div>
        </div>

        {/* Content */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {/* Gallery */}
        {journal.gallery_images && journal.gallery_images.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Photo Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {journal.gallery_images.map((img: string, idx: number) => (
                <div key={idx} className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <Card className="mb-8">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <Button
                variant={journal.user_has_liked ? "default" : "outline"}
                size="sm"
                onClick={() => likeMutation.mutate()}
                disabled={!user || likeMutation.isPending}
              >
                <Heart className="mr-2 h-4 w-4" fill={journal.user_has_liked ? "currentColor" : "none"} />
                {journal.likes_count || 0} Likes
              </Button>
            </div>
            <ShareButtons
              url={window.location.href}
              title={journal.title}
              description={journal.excerpt}
            />
          </CardContent>
        </Card>

        {/* Related Journals */}
        {journal.related_journals && journal.related_journals.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-4">Related Journals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {journal.related_journals.map((related: any) => (
                <Link key={related.id} to={`/journals/${related.slug}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    {related.cover_image && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={related.cover_image}
                          alt={related.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h4 className="font-semibold line-clamp-2">{related.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(related.published_at), "MMM dd, yyyy")}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
