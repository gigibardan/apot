import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="post-content">Conținut</Label>
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
                      <p><code>```code block```</code> pentru bloc de cod</p>
                      <p><code>&gt; quote</code> pentru citat</p>
                      <p><code>- item</code> pentru listă</p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Scrie conținutul discuției... (suportă Markdown)"
              rows={12}
              required
              disabled={isSubmitting}
              className="resize-none font-mono"
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
