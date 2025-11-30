import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFollowingActivityFeed } from "@/lib/supabase/queries/social";
import { ActivityFeedItem } from "@/components/features/social/ActivityFeedItem";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo/SEO";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Users } from "lucide-react";

export default function ActivityFeed() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["activityFeed", page, filter],
    queryFn: () => getFollowingActivityFeed(page, 20),
  });

  return (
    <>
      <SEO
        title="Activity Feed"
        description="See what's happening in the travel community"
      />

      <div className="container py-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Activity Feed</h1>
            <p className="text-muted-foreground">
              See what your friends are up to
            </p>
          </div>
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="journals">Journals</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <LoadingSpinner />
        ) : !data?.activities || data.activities.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
            <p className="text-muted-foreground mb-4">
              Follow users to see their activity here
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {data.activities.map((activity: any) => (
              <ActivityFeedItem key={activity.id} activity={activity} />
            ))}

            {data.hasMore && (
              <div className="flex justify-center mt-6">
                <Button onClick={() => setPage(page + 1)} variant="outline">
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
