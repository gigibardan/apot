import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="reply-content">Răspunsul tău</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" type="button">
                <HelpCircle className="h-4 w-4 mr-1" />
                Markdown
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold">Formatare Markdown</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p><code>**bold**</code> pentru <strong>bold</strong></p>
                  <p><code>*italic*</code> pentru <em>italic</em></p>
                  <p><code>[link](url)</code> pentru linkuri</p>
                  <p><code>`code`</code> pentru cod inline</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Textarea
          id="reply-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`${placeholder} (suportă Markdown)`}
          rows={4}
          required
          disabled={isSubmitting}
          className="resize-none font-mono"
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
