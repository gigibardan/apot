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
  Plus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { MarkdownContent } from "@/components/features/forum/MarkdownContent";
import { ReputationBadge } from "@/components/features/forum/ReputationBadge";
import { SubscribeButton } from "@/components/features/forum/SubscribeButton";
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
    queryKey: ['forum-replies', post?.id, user?.id],
    queryFn: () => getRepliesForPost(post!.id, user?.id),
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
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!post) {
    return (
      <Container className="py-12">
        <Alert variant="destructive">
          <AlertDescription>Discuția nu a fost găsită.</AlertDescription>
        </Alert>
      </Container>
    );
  }

  const authorName = post.author?.full_name || 'Utilizator Anonim';
  const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isOwner = user?.id === post.user_id;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pb-20 md:pb-10">
      <SEO
        title={post.title}
        description={post.content.substring(0, 160)}
        canonical={`/forum/${categorySlug}/${postSlug}`}
      />

      {/* =============================================
        1. COMPACT HERO (Dark Style)
        ============================================= */}
      <div className="bg-[#0F172A] text-white border-b border-white/10">
        <Container className="py-6 md:py-10">
          <Link
            to={`/forum/${categorySlug}`}
            className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-primary transition-colors mb-4 uppercase tracking-wider"
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            Înapoi la {post.category?.name}
          </Link>

          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {post.pinned && <Badge className="bg-primary text-white border-none h-5 text-[10px]">PINNED</Badge>}
                  {post.locked && <Lock className="h-4 w-4 text-slate-500" />}
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                    {post.title}
                  </h1>
                </div>

                {/* Meta Author Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border border-white/10">
                    <AvatarImage src={post.author?.avatar_url || undefined} />
                    <AvatarFallback className="bg-slate-800 text-xs">{authorInitials}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200">{authorName}</span>
                      {post.author?.id && <ReputationBadge userId={post.author.id} />}
                    </div>
                    <p className="text-xs text-slate-500">
                      postat {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ro })}
                    </p>
                  </div>
                </div>
              </div>

              {isOwner && (
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-white">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-slate-400 hover:text-destructive"
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
          </div>
        </Container>
      </div>

      {/* =============================================
        2. MAIN CONTENT
        ============================================= */}
      <Container className="py-8">
        <div className="grid lg:grid-cols-4 gap-8">

          <div className="lg:col-span-3 space-y-8">
            {/* Post Content Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-5 md:p-8">
                <MarkdownContent content={post.content} className="prose dark:prose-invert max-w-none mb-8" />

                {/* Desktop Actions Bar */}
                <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-full p-1 border dark:border-slate-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-full h-8 px-3 ${userVote === 'upvote' ? 'text-primary bg-primary/10' : ''}`}
                      onClick={() => votePostMutation.mutate({ voteType: 'upvote' })}
                      disabled={!user}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1.5" />
                      {post.upvotes_count}
                    </Button>
                    <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-full h-8 px-3 ${userVote === 'downvote' ? 'text-destructive bg-destructive/10' : ''}`}
                      onClick={() => votePostMutation.mutate({ voteType: 'downvote' })}
                      disabled={!user}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1.5" />
                      <span className="text-xs font-medium">{post.downvotes_count || 0}</span>
                    </Button>
                  </div>

                  <div className="hidden sm:flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full font-normal py-1">
                      <MessageSquare className="h-3 w-3 mr-1.5 text-slate-400" />
                      {post.replies_count} răspunsuri
                    </Badge>
                    <Badge variant="outline" className="rounded-full font-normal py-1">
                      <Eye className="h-3 w-3 mr-1.5 text-slate-400" />
                      {post.views_count} vizualizări
                    </Badge>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <SubscribeButton postId={post.id} />
                    {!isOwner && user && (
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <Flag className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Replies Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Răspunsuri
                  <span className="text-sm font-normal text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {post.replies_count}
                  </span>
                </h2>
              </div>

              {/* Reply Form */}
              {!post.locked && user && (
                <div className="px-2">
                  {showReplyForm ? (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-primary/20 animate-in fade-in zoom-in-95">
                      <ReplyForm
                        postId={post.id}
                        onSubmit={(content) => createReplyMutation.mutate({ parentReplyId: null, content })}
                        onCancel={() => setShowReplyForm(false)}
                        placeholder="Scrie un răspuns..."
                      />
                    </div>
                  ) : (
                    <Button
                      className="w-full md:w-auto rounded-xl h-12 px-6 shadow-sm"
                      onClick={() => setShowReplyForm(true)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Adaugă un răspuns
                    </Button>
                  )}
                </div>
              )}

              {/* Replies List */}
              {repliesLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-6">
                  {replies?.length ? (
                    replies.map((reply) => (
                      <ReplyCard
                        key={reply.id}
                        reply={reply}
                        postId={post.id}
                        onVote={(replyId, voteType) => voteReplyMutation.mutate({ replyId, voteType })}
                        onReply={(parentId, content) => createReplyMutation.mutate({ parentReplyId: parentId, content })}
                        onEdit={(replyId, content) => updateReplyMutation.mutate({ replyId, content })}
                        onDelete={(replyId) => {
                          if (confirm("Sigur dorești să ștergi acest răspuns?")) {
                            deleteReplyMutation.mutate(replyId);
                          }
                        }}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-slate-500">Nu există răspunsuri încă. Fii primul!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Stats Section (Hidden on mobile or moved to end) */}
          <aside className="space-y-6 lg:block hidden">
            <div className="sticky top-24">
              {post.locked && (
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 text-amber-800 dark:text-amber-200">
                  <Lock className="h-4 w-4" />
                  <AlertDescription>Discuție închisă.</AlertDescription>
                </Alert>
              )}
              {/* Poți adăuga aici un Widget cu regulile forumului sau postări similare */}
            </div>
          </aside>
        </div>
      </Container>

      {/* Mobile Floating Action Button (Optional but helpful) */}
      {!post.locked && user && !showReplyForm && (
        <div className="fixed bottom-6 right-6 md:hidden z-50">
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-2xl shadow-primary/40"
            onClick={() => {
              setShowReplyForm(true);
              window.scrollTo({ top: document.getElementById('categories')?.offsetTop || 400, behavior: 'smooth' });
            }}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}