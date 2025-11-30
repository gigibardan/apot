/**
 * User Forum Posts List Component
 * Displays forum posts created by the user
 * 
 * Features:
 * - Post title, preview and metadata
 * - Category badges with colors
 * - Engagement metrics (views, replies, upvotes)
 * - Links to forum posts
 * - Pagination support
 * - Loading and empty states
 */

import { useQuery } from "@tanstack/react-query";
import { getUserForumPosts } from "@/lib/supabase/queries/social";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Eye, ThumbsUp, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface UserPostsListProps {
  userId: string;
}

export function UserPostsList({ userId }: UserPostsListProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["userForumPosts", userId, page],
    queryFn: () => getUserForumPosts(userId, page, 12)
  });

  if (isLoading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!data || data.posts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Niciun post pe forum încă</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {data.posts.map((post) => {
        if (!post.category) return null;

        // Strip HTML tags for preview
        const contentPreview = post.content
          .replace(/<[^>]*>/g, '')
          .substring(0, 200);

        return (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <Link 
                    to={`/forum/${post.category.slug}/${post.slug}`}
                    className="hover:text-primary"
                  >
                    <h3 className="font-semibold text-lg mb-2 hover:underline">
                      {post.title}
                    </h3>
                  </Link>
                  
                  <Badge 
                    variant="outline" 
                    className="mb-3"
                    style={{ 
                      borderColor: post.category.color || undefined,
                      color: post.category.color || undefined
                    }}
                  >
                    {post.category.name}
                  </Badge>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {contentPreview}
                    {post.content.length > 200 && '...'}
                  </p>
                </div>

                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 border-t">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.views_count}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.replies_count} răspunsuri</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{post.upvotes_count}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {data.hasMore && (
        <div className="flex justify-center pt-4">
          <Button 
            onClick={() => setPage(p => p + 1)}
            variant="outline"
          >
            Încarcă mai multe
          </Button>
        </div>
      )}
    </div>
  );
}