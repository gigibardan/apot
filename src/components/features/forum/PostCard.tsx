import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Eye, ThumbsUp, Pin, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import type { ForumPost } from "@/types/forum";
import { ReputationBadge } from "./ReputationBadge";

interface PostCardProps {
  post: ForumPost;
  categorySlug: string;
}

export function PostCard({ post, categorySlug }: PostCardProps) {
  const authorName = post.author?.full_name || 'Utilizator Anonim';
  const authorInitials = authorName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link to={`/forum/${categorySlug}/${post.slug}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Author Avatar */}
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={post.author?.avatar_url || undefined} alt={authorName} />
              <AvatarFallback>{authorInitials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Title with badges */}
              <div className="flex items-start gap-2 mb-1">
                {post.pinned && (
                  <Pin className="h-4 w-4 text-primary shrink-0 mt-1" />
                )}
                {post.locked && (
                  <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                )}
                <h3 className="font-semibold hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
                <Link 
                  to={`/profil/${post.author?.username || post.user_id}`}
                  className="hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  de {authorName}
                </Link>
                {post.author?.id && <ReputationBadge userId={post.author.id} showPoints={false} />}
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    locale: ro,
                  })}
                </span>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 mt-3">
                <Badge variant="secondary" className="gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {post.upvotes_count}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {post.replies_count}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Eye className="h-3 w-3" />
                  {post.views_count}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
