import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { 
  getFollowingActivityFeed,
  getUserFavorites,
  getUserReviews,
  getUserForumPosts
} from "@/lib/supabase/queries/social";
import { ActivityFeedItem } from "@/components/features/social/ActivityFeedItem";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { SEO } from "@/components/seo/SEO";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  Heart, 
  Star, 
  MessageSquare, 
  BookOpen,
  MapPin,
  Calendar,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

export default function ActivityFeed() {
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Activity feed query
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ["activityFeed", page],
    queryFn: () => getFollowingActivityFeed(page, 20),
    enabled: !!user,
  });

  // Favorites query
  const { data: favoritesData, isLoading: favoritesLoading } = useQuery({
    queryKey: ["userFavorites", user?.id, 1],
    queryFn: () => getUserFavorites(user!.id, 1, 20),
    enabled: !!user,
  });

  // Reviews query
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["userReviews", user?.id, 1],
    queryFn: () => getUserReviews(user!.id, 1, 20),
    enabled: !!user,
  });

  // Forum posts query
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["userPosts", user?.id, 1],
    queryFn: () => getUserForumPosts(user!.id, 1, 20),
    enabled: !!user,
  });

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="container py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Autentificare necesară</h2>
        <p className="text-muted-foreground mb-6">
          Trebuie să fii autentificat pentru a vedea feed-ul de activitate.
        </p>
        <Button onClick={() => navigate("/auth/login")}>Conectează-te</Button>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Feed Activitate"
        description="Vezi ce fac prietenii tăi în comunitatea de călătorii"
      />

      <div className="container py-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Feed Activitate</h1>
            <p className="text-muted-foreground">
              Vezi ce fac prietenii tăi
            </p>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Toate</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favorite</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Recenzii</span>
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Posturi</span>
            </TabsTrigger>
            <TabsTrigger value="journals" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Jurnale</span>
            </TabsTrigger>
          </TabsList>

          {/* All Activity Tab */}
          <TabsContent value="all">
            {activityLoading ? (
              <LoadingSpinner />
            ) : !activityData?.activities || activityData.activities.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nicio activitate încă</h3>
                <p className="text-muted-foreground mb-4">
                  Urmărește utilizatori pentru a vedea activitatea lor aici
                </p>
                <Button onClick={() => navigate("/leaderboards")}>
                  Descoperă Utilizatori
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {activityData.activities.map((activity: any) => (
                  <ActivityFeedItem key={activity.id} activity={activity} />
                ))}

                {activityData.hasMore && (
                  <div className="flex justify-center mt-6">
                    <Button onClick={() => setPage(page + 1)} variant="outline">
                      Încarcă mai multe
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            {favoritesLoading ? (
              <LoadingSpinner />
            ) : !favoritesData?.favorites || favoritesData.favorites.length === 0 ? (
              <Card className="p-12 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Niciun favorit încă</h3>
                <p className="text-muted-foreground mb-4">
                  Adaugă obiective la favorite pentru a le vedea aici
                </p>
                <Button onClick={() => navigate("/obiective")}>
                  Explorează Obiective
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoritesData.favorites.map((fav: any) => (
                  <Card key={fav.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <Link to={`/obiective/${fav.objective?.slug}`}>
                      <AspectRatio ratio={16 / 9}>
                        <img
                          src={fav.objective?.featured_image || "/placeholder.svg"}
                          alt={fav.objective?.title}
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                      <CardContent className="p-4">
                        <h3 className="font-semibold line-clamp-1 mb-2">
                          {fav.objective?.title}
                        </h3>
                        {fav.objective?.country && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-3 w-3" />
                            {fav.objective.country.name}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Salvat {format(new Date(fav.created_at), "d MMM yyyy", { locale: ro })}
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            {reviewsLoading ? (
              <LoadingSpinner />
            ) : !reviewsData?.reviews || reviewsData.reviews.length === 0 ? (
              <Card className="p-12 text-center">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nicio recenzie încă</h3>
                <p className="text-muted-foreground mb-4">
                  Scrie recenzii pentru obiective sau ghizi
                </p>
                <Button onClick={() => navigate("/obiective")}>
                  Explorează Obiective
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviewsData.reviews.map((review: any) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-start gap-4">
                      {review.type === "objective" && review.objective && (
                        <Link to={`/obiective/${review.objective.slug}`} className="flex-shrink-0">
                          <img
                            src={review.objective.featured_image || "/placeholder.svg"}
                            alt={review.objective.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </Link>
                      )}
                      {review.type === "guide" && review.guide && (
                        <Link to={`/ghid/${review.guide.slug}`} className="flex-shrink-0">
                          <img
                            src={review.guide.profile_image || "/placeholder.svg"}
                            alt={review.guide.full_name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </Link>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={review.type === "objective" ? "default" : "secondary"}>
                            {review.type === "objective" ? "Obiectiv" : "Ghid"}
                          </Badge>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <h4 className="font-semibold line-clamp-1">
                          {review.type === "objective"
                            ? review.objective?.title
                            : review.guide?.full_name}
                        </h4>
                        {review.title && (
                          <p className="text-sm font-medium mt-1">{review.title}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {review.comment}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(review.created_at), "d MMM yyyy", { locale: ro })}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            {postsLoading ? (
              <LoadingSpinner />
            ) : !postsData?.posts || postsData.posts.length === 0 ? (
              <Card className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nicio postare încă</h3>
                <p className="text-muted-foreground mb-4">
                  Participă la discuții pe forum
                </p>
                <Button onClick={() => navigate("/forum")}>
                  Mergi la Forum
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {postsData.posts.map((post: any) => (
                  <Card key={post.id} className="p-4 hover:shadow-md transition-shadow">
                    <Link to={`/forum/${post.category?.slug}/${post.slug}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {post.category && (
                              <Badge variant="outline" className="text-xs">
                                {post.category.name}
                              </Badge>
                            )}
                            {post.pinned && (
                              <Badge variant="secondary" className="text-xs">
                                Fixat
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold line-clamp-1">{post.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {post.content?.replace(/<[^>]*>/g, "").slice(0, 150)}...
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {post.replies_count} răspunsuri
                            </span>
                            <span>
                              {format(new Date(post.created_at), "d MMM yyyy", { locale: ro })}
                            </span>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Journals Tab */}
          <TabsContent value="journals">
            <Card className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Jurnale de călătorie</h3>
              <p className="text-muted-foreground mb-4">
                Explorează jurnalele de călătorie ale comunității
              </p>
              <Button onClick={() => navigate("/journals")}>
                Vezi Jurnale
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
