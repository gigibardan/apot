import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PostFormProps {
  categoryId: string;
  onSubmit: (data: { title: string; content: string }) => void;
  onCancel?: () => void;
  initialData?: {
    title?: string;
    content?: string;
  };
  submitLabel?: string;
}

export function PostForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = "Creează discuție",
}: PostFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ title, content });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Editează discuția' : 'Discuție nouă'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="post-title">Titlu</Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Introdu un titlu descriptiv..."
              required
              disabled={isSubmitting}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {title.length}/200 caractere
            </p>
          </div>

          <div>
            <Label htmlFor="post-content">Conținut</Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Scrie conținutul discuției..."
              rows={12}
              required
              disabled={isSubmitting}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting ? "Se salvează..." : submitLabel}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Anulează
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
