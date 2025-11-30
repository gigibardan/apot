import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ChevronLeft, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Eye, 
  Edit,
  Trash2,
  Flag,
  Lock,
  Pin,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getPostBySlug, 
  getRepliesForPost,
  getUserVoteForPost,
} from "@/lib/supabase/queries/forum";
import { 
  voteOnPost, 
  voteOnReply,
  createReply,
  updateReply,
  deleteReply,
  deletePost,
} from "@/lib/supabase/mutations/forum";
import { ReplyCard } from "@/components/features/forum/ReplyCard";
import { ReplyForm } from "@/components/features/forum/ReplyForm";

export default function ForumPostPage() {
  const { categorySlug, postSlug } = useParams<{ categorySlug: string; postSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showReplyForm, setShowReplyForm] = useState(false);

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['forum-post', categorySlug, postSlug],
    queryFn: () => getPostBySlug(categorySlug!, postSlug!),
    enabled: !!categorySlug && !!postSlug,
  });

  const { data: replies, isLoading: repliesLoading } = useQuery({
    queryKey: ['forum-replies', post?.id],
    queryFn: () => getRepliesForPost(post!.id),
    enabled: !!post,
  });

  const { data: userVote } = useQuery({
    queryKey: ['forum-post-vote', post?.id, user?.id],
    queryFn: () => getUserVoteForPost(post!.id, user!.id),
    enabled: !!post && !!user,
  });

  const votePostMutation = useMutation({
    mutationFn: ({ voteType }: { voteType: 'upvote' | 'downvote' }) =>
      voteOnPost(post!.id, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-post', categorySlug, postSlug] });
      queryClient.invalidateQueries({ queryKey: ['forum-post-vote', post!.id, user!.id] });
    },
  });

  const voteReplyMutation = useMutation({
    mutationFn: ({ replyId, voteType }: { replyId: string; voteType: 'upvote' | 'downvote' }) =>
      voteOnReply(replyId, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-replies', post!.id] });
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: ({ parentReplyId, content }: { parentReplyId: string | null; content: string }) =>
      createReply({
        post_id: post!.id,
        parent_reply_id: parentReplyId,
        content,
      }),
    onSuccess: () => {
      toast.success("Răspunsul a fost adăugat!");
      queryClient.invalidateQueries({ queryKey: ['forum-replies', post!.id] });
      queryClient.invalidateQueries({ queryKey: ['forum-post', categorySlug, postSlug] });
      setShowReplyForm(false);
    },
    onError: () => {
      toast.error("A apărut o eroare. Te rugăm să încerci din nou.");
    },
  });

  const updateReplyMutation = useMutation({
    mutationFn: ({ replyId, content }: { replyId: string; content: string }) =>
      updateReply(replyId, { content }),
    onSuccess: () => {
      toast.success("Răspunsul a fost actualizat!");
      queryClient.invalidateQueries({ queryKey: ['forum-replies', post!.id] });
    },
  });

  const deleteReplyMutation = useMutation({
    mutationFn: deleteReply,
    onSuccess: () => {
      toast.success("Răspunsul a fost șters!");
      queryClient.invalidateQueries({ queryKey: ['forum-replies', post!.id] });
      queryClient.invalidateQueries({ queryKey: ['forum-post', categorySlug, postSlug] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      toast.success("Discuția a fost ștearsă!");
      navigate(`/forum/${categorySlug}`);
    },
  });

  if (postLoading) {
    return <LoadingSpinner />;
  }

  if (!post) {
    return (
      <Container className="py-12">
        <Alert>
          <AlertDescription>Discuția nu a fost găsită.</AlertDescription>
        </Alert>
      </Container>
    );
  }

  const authorName = post.author?.full_name || 'Utilizator Anonim';
  const authorInitials = authorName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isOwner = user?.id === post.user_id;

  return (
    <>
      <SEO
        title={post.title}
        description={post.content.substring(0, 160)}
        canonical={`/forum/${categorySlug}/${postSlug}`}
      />

      <Section className="bg-gradient-to-b from-primary/5 to-background">
        <Container>
          <div className="py-6">
            <Link 
              to={`/forum/${categorySlug}`} 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Înapoi la {post.category?.name}
            </Link>
          </div>
        </Container>
      </Section>

      <Container className="py-8">
        {/* Main Post */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author?.avatar_url || undefined} alt={authorName} />
              <AvatarFallback>{authorInitials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {post.pinned && <Pin className="h-4 w-4 text-primary" />}
                {post.locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                <h1 className="text-2xl font-bold">{post.title}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>de {authorName}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    locale: ro,
                  })}
                </span>
              </div>
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    if (confirm("Sigur dorești să ștergi această discuție?")) {
                      deletePostMutation.mutate(post.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="prose prose-sm max-w-none mb-6">
            <div className="whitespace-pre-wrap">{post.content}</div>
          </div>

          {/* Stats & Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
            {/* Vote buttons */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={userVote === 'upvote' ? 'default' : 'outline'}
                onClick={() => votePostMutation.mutate({ voteType: 'upvote' })}
                disabled={!user}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {post.upvotes_count}
              </Button>
              <Button
                size="sm"
                variant={userVote === 'downvote' ? 'default' : 'outline'}
                onClick={() => votePostMutation.mutate({ voteType: 'downvote' })}
                disabled={!user}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                {post.downvotes_count}
              </Button>
            </div>

            <Badge variant="secondary">
              <MessageSquare className="h-3 w-3 mr-1" />
              {post.replies_count} răspunsuri
            </Badge>

            <Badge variant="secondary">
              <Eye className="h-3 w-3 mr-1" />
              {post.views_count} vizualizări
            </Badge>

            {!isOwner && user && (
              <Button size="sm" variant="ghost">
                <Flag className="h-4 w-4 mr-1" />
                Raportează
              </Button>
            )}
          </div>
        </div>

        {/* Reply Form for Main Post */}
        {!post.locked && user && (
          <div className="mb-8">
            {showReplyForm ? (
              <ReplyForm
                postId={post.id}
                onSubmit={(content) => createReplyMutation.mutate({ parentReplyId: null, content })}
                onCancel={() => setShowReplyForm(false)}
                placeholder="Scrie un răspuns..."
              />
            ) : (
              <Button onClick={() => setShowReplyForm(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Scrie un răspuns
              </Button>
            )}
          </div>
        )}

        {post.locked && (
          <Alert className="mb-8">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Această discuție a fost închisă. Nu mai pot fi adăugate răspunsuri noi.
            </AlertDescription>
          </Alert>
        )}

        {!user && (
          <Alert className="mb-8">
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              <Link to="/auth/login" className="font-semibold underline">
                Autentifică-te
              </Link>{" "}
              pentru a răspunde la această discuție.
            </AlertDescription>
          </Alert>
        )}

        {/* Replies */}
        <div>
          <h2 className="text-xl font-bold mb-6">
            Răspunsuri ({post.replies_count})
          </h2>
          
          {repliesLoading ? (
            <LoadingSpinner />
          ) : replies && replies.length > 0 ? (
            <div className="space-y-6">
              {replies.map((reply) => (
                <ReplyCard
                  key={reply.id}
                  reply={reply}
                  postId={post.id}
                  onVote={(replyId, voteType) => voteReplyMutation.mutate({ replyId, voteType })}
                  onReply={(parentId, content) => 
                    createReplyMutation.mutate({ parentReplyId: parentId, content })
                  }
                  onEdit={(replyId, content) => updateReplyMutation.mutate({ replyId, content })}
                  onDelete={(replyId) => {
                    if (confirm("Sigur dorești să ștergi acest răspuns?")) {
                      deleteReplyMutation.mutate(replyId);
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                Nu există răspunsuri încă. Fii primul care răspunde!
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Container>
    </>
  );
}
