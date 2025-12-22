import { useState } from "react";
import { MessageCircle, Reply, Trash2, Edit2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  createJournalComment,
  updateJournalComment,
  deleteJournalComment,
} from "@/lib/supabase/queries/journal-comments";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
  };
  replies?: Comment[];
}

interface JournalCommentsProps {
  journalId: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

function CommentItem({
  comment,
  journalId,
  onReply,
  onDelete,
  onUpdate,
  isReply = false,
}: {
  comment: Comment;
  journalId: string;
  onReply: () => void;
  onDelete: () => void;
  onUpdate: () => void;
  isReply?: boolean;
}) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);

  const isOwner = user?.id === comment.user.id;

  const handleUpdate = async () => {
    if (!editContent.trim()) return;

    setIsUpdating(true);
    try {
      await updateJournalComment(comment.id, editContent);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getUserInitials = () => {
    return comment.user.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";
  };

  return (
    <div className={`flex gap-3 ${isReply ? "ml-12" : ""}`}>
      <Avatar className="h-10 w-10">
        <AvatarImage src={comment.user.avatar_url || undefined} />
        <AvatarFallback>{getUserInitials()}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-medium text-sm">{comment.user.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ro,
                })}
                {comment.updated_at !== comment.created_at && " (editat)"}
              </p>
            </div>

            {isOwner && !isEditing && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px]"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={isUpdating || !editContent.trim()}
                >
                  Salvează
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Anulează
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          )}
        </div>

        {!isReply && user && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 text-xs"
            onClick={onReply}
          >
            <Reply className="h-3 w-3 mr-1" />
            Răspunde
          </Button>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                journalId={journalId}
                onReply={() => {}}
                onDelete={onUpdate}
                onUpdate={onUpdate}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function JournalComments({
  journalId,
  comments,
  onCommentAdded,
}: JournalCommentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Autentificare necesară",
        description: "Trebuie să fii autentificat pentru a comenta.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await createJournalComment({
        journal_id: journalId,
        content: newComment.trim(),
      });

      setNewComment("");
      onCommentAdded();
      toast({
        title: "Comentariu adăugat!",
        description: "Comentariul tău a fost publicat cu succes.",
      });
    } catch (error) {
      console.error("Error creating comment:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut publica comentariul. Încearcă din nou.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!user || !replyToId) return;
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await createJournalComment({
        journal_id: journalId,
        content: replyContent.trim(),
        parent_id: replyToId,
      });

      setReplyContent("");
      setReplyToId(null);
      onCommentAdded();
      toast({
        title: "Răspuns adăugat!",
        description: "Răspunsul tău a fost publicat cu succes.",
      });
    } catch (error) {
      console.error("Error creating reply:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut publica răspunsul. Încearcă din nou.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Sigur vrei să ștergi acest comentariu?")) return;

    try {
      await deleteJournalComment(commentId);
      onCommentAdded();
      toast({
        title: "Comentariu șters",
        description: "Comentariul a fost șters cu succes.",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge comentariul. Încearcă din nou.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="text-lg font-semibold">
            Comentarii ({comments.length})
          </h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Comment Form */}
        {user && (
          <div className="space-y-3">
            <Textarea
              placeholder="Scrie un comentariu..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Publică comentariu
              </Button>
            </div>
          </div>
        )}

        {!user && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Trebuie să fii autentificat pentru a comenta.
          </p>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Niciun comentariu încă. Fii primul care comentează!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  journalId={journalId}
                  onReply={() => setReplyToId(comment.id)}
                  onDelete={() => handleDeleteComment(comment.id)}
                  onUpdate={onCommentAdded}
                />

                {/* Reply Form */}
                {replyToId === comment.id && user && (
                  <div className="ml-12 mt-3 space-y-2">
                    <Textarea
                      placeholder="Scrie un răspuns..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSubmitReply}
                        disabled={isSubmitting || !replyContent.trim()}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Răspunde
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReplyToId(null);
                          setReplyContent("");
                        }}
                      >
                        Anulează
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}