import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, MessageSquare, Flag, Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { ForumReply } from "@/types/forum";
import { MarkdownContent } from "./MarkdownContent";
import { ReplyForm } from "./ReplyForm";
import { ReputationBadge } from "./ReputationBadge";

interface ReplyCardProps {
  reply: ForumReply;
  postId: string;
  onVote: (replyId: string, voteType: 'upvote' | 'downvote') => void;
  onReply: (parentId: string, content: string) => void;
  onEdit?: (replyId: string, content: string) => void;
  onDelete?: (replyId: string) => void;
  onReport?: (replyId: string) => void;
}

export function ReplyCard({
  reply,
  postId,
  onVote,
  onReply,
  onEdit,
  onDelete,
  onReport,
}: ReplyCardProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);

  const authorName = reply.author?.full_name || 'Utilizator Anonim';
  const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const isOwner = user?.id === reply.user_id;
  const canReply = reply.depth < 3;

  const handleSubmitEdit = () => {
    if (onEdit && editContent.trim()) {
      onEdit(reply.id, editContent);
      setIsEditing(false);
    }
  };
console.log('Reply downvotes:', reply.downvotes_count, reply);

  return (
    <div className={cn(
      "flex gap-2 md:gap-3 transition-all",
      reply.depth > 0 && "ml-3 md:ml-12 mt-4 pl-3 md:pl-0 border-l-2 md:border-l-0 border-slate-100 dark:border-slate-800"
    )}>
      {/* Avatar */}
      <Avatar className={cn(
        "shrink-0 transition-all",
        reply.depth > 0 ? "h-6 w-6 md:h-8 md:w-8" : "h-8 w-8 md:h-10 md:w-10"
      )}>
        <AvatarImage src={reply.author?.avatar_url || undefined} alt={authorName} />
        <AvatarFallback className="text-[10px] md:text-xs">{authorInitials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 text-left">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Link
            to={`/profil/${reply.author?.username || reply.user_id}`}
            className="font-bold text-xs md:text-sm hover:text-primary transition-colors truncate max-w-[120px] md:max-w-none"
          >
            {authorName}
          </Link>
          <div className="flex items-center gap-1.5">
            {reply.author?.id && <ReputationBadge userId={reply.author.id} showPoints={false} />}
            <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: ro })}
            </span>
          </div>
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-2 mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[100px] p-2 text-sm border rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmitEdit}>Salvează</Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Anulează</Button>
            </div>
          </div>
        ) : (
          <div className="mb-2 text-sm md:text-base leading-relaxed break-words">
            <MarkdownContent content={reply.content} />
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-1 md:gap-2">
          <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-lg p-0.5 border dark:border-slate-800">
            {/* Buton Upvote */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVote(reply.id, 'upvote')}
              disabled={!user}
              className={cn(
                "h-7 px-2 rounded-md transition-colors flex items-center gap-1",
                reply.user_vote === 'upvote' && "text-primary bg-primary/10"
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{reply.upvotes_count || 0}</span>
            </Button>

            {/* Separator vertical */}
            <div className="w-[1px] h-3 bg-slate-200 dark:bg-slate-700 mx-0.5" />

            {/* Buton Downvote */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVote(reply.id, 'downvote')}
              disabled={!user}
              className={cn(
                "h-7 px-2 rounded-md transition-colors flex items-center gap-1",
                reply.user_vote === 'downvote' && "text-destructive bg-destructive/10"
              )}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{reply.downvotes_count || 0}</span>
            </Button>
          </div>

          {/* Reply Button */}
          {canReply && user && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="h-7 text-xs font-medium text-slate-500"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              Răspunde
            </Button>
          )}

          {/* Owner Actions */}
          {isOwner && !isEditing && (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="h-7 w-7 p-0">
                <Edit className="h-3.5 w-3.5 text-slate-400" />
              </Button>
              {onDelete && (
                <Button size="sm" variant="ghost" onClick={() => onDelete(reply.id)} className="h-7 w-7 p-0 text-destructive/70">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Reply Form Injection */}
        {showReplyForm && (
          <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <ReplyForm
              postId={postId}
              parentReplyId={reply.id}
              onSubmit={(content) => {
                onReply(reply.id, content);
                setShowReplyForm(false);
              }}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}

        {/* Nested Replies Recursion */}
        {reply.replies && reply.replies.length > 0 && (
          <div className="mt-2 space-y-2 md:space-y-4">
            {reply.replies.map((nestedReply) => (
              <ReplyCard
                key={nestedReply.id}
                reply={nestedReply}
                postId={postId}
                onVote={onVote}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onReport={onReport}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}