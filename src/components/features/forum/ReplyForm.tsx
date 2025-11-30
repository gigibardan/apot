import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ReplyFormProps {
  postId: string;
  parentReplyId?: string | null;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function ReplyForm({ 
  onSubmit, 
  onCancel,
  placeholder = "Scrie răspunsul tău..." 
}: ReplyFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="reply-content" className="sr-only">
          Conținut răspuns
        </Label>
        <Textarea
          id="reply-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={4}
          required
          disabled={isSubmitting}
          className="resize-none"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? "Se trimite..." : "Trimite răspuns"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Anulează
          </Button>
        )}
      </div>
    </form>
  );
}
