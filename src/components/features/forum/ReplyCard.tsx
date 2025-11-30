import { useState } from "react";
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
  const authorInitials = authorName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isOwner = user?.id === reply.user_id;
  const canReply = reply.depth < 3;

  const handleSubmitEdit = () => {
    if (onEdit && editContent.trim()) {
      onEdit(reply.id, editContent);
      setIsEditing(false);
    }
  };

  return (
    <div className={cn("flex gap-3", reply.depth > 0 && "ml-12 mt-4")}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={reply.author?.avatar_url || undefined} alt={authorName} />
        <AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-semibold text-sm">{authorName}</span>
          {reply.author?.id && <ReputationBadge userId={reply.author.id} showPoints={false} />}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(reply.created_at), {
              addSuffix: true,
              locale: ro,
            })}
          </span>
          {reply.depth > 0 && (
            <Badge variant="outline" className="text-xs">
              Nivel {reply.depth}
            </Badge>
          )}
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-2 mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[100px] p-2 border rounded-md"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmitEdit}>
                Salvează
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Anulează
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <MarkdownContent content={reply.content} />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Vote buttons */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={reply.user_vote === 'upvote' ? 'default' : 'ghost'}
              onClick={() => onVote(reply.id, 'upvote')}
              disabled={!user}
              className="h-7 px-2"
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              {reply.upvotes_count}
            </Button>
            <Button
              size="sm"
              variant={reply.user_vote === 'downvote' ? 'default' : 'ghost'}
              onClick={() => onVote(reply.id, 'downvote')}
              disabled={!user}
              className="h-7 px-2"
            >
              <ThumbsDown className="h-3 w-3 mr-1" />
              {reply.downvotes_count}
            </Button>
          </div>

          {/* Reply button */}
          {canReply && user && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="h-7"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Răspunde
            </Button>
          )}

          {/* Edit/Delete for owner */}
          {isOwner && !isEditing && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-7"
              >
                <Edit className="h-3 w-3 mr-1" />
                Editează
              </Button>
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(reply.id)}
                  className="h-7 text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Șterge
                </Button>
              )}
            </>
          )}

          {/* Report button */}
          {!isOwner && user && onReport && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onReport(reply.id)}
              className="h-7"
            >
              <Flag className="h-3 w-3 mr-1" />
              Raportează
            </Button>
          )}
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-3">
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

        {/* Nested replies */}
        {reply.replies && reply.replies.length > 0 && (
          <div className="mt-4 space-y-4">
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
