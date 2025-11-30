import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getPublishedJournals } from "@/lib/supabase/queries/journals";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/seo/SEO";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { BookOpen, Calendar, Eye, Heart, PenLine } from "lucide-react";
import { format } from "date-fns";

export default function TravelJournals() {
  const [filter, setFilter] = useState<"recent" | "popular" | "following">("recent");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["journals", filter, page],
    queryFn: () => getPublishedJournals(page, 12),
  });

  return (
    <>
      <SEO
        title="Travel Journals"
        description="Read travel stories and adventures from our community"
      />

      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Travel Journals</h1>
              <p className="text-muted-foreground">
                Stories and adventures from travelers
              </p>
            </div>
          </div>
          <Link to="/journals/new">
            <Button>
              <PenLine className="mr-2 h-4 w-4" />
              Write Journal
            </Button>
          </Link>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-6">
          <TabsList>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <LoadingSpinner />
        ) : !data?.journals || data.journals.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No journals yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share your travel story
            </p>
            <Link to="/journals/new">
              <Button>Write First Journal</Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.journals.map((journal: any) => (
                <Link key={journal.id} to={`/journals/${journal.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    {journal.cover_image && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={journal.cover_image}
                          alt={journal.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {journal.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(journal.published_at), "MMM dd, yyyy")}
                      </div>
                      {journal.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {journal.excerpt}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="px-4 py-3 bg-muted/50 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {journal.views_count || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {journal.likes_count || 0}
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        {journal.user?.full_name}
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {data.hasMore && (
              <div className="flex justify-center mt-8">
                <Button onClick={() => setPage(page + 1)} variant="outline">
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
