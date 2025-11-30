import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Heading2,
  Undo,
  Redo,
  Code,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import DOMPurify from "dompurify";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Scrie conținutul aici...",
}: RichTextEditorProps) {
  const [linkDialog, setLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageDialog, setImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [videoDialog, setVideoDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Youtube.configure({
        width: 640,
        height: 480,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] max-w-none p-4",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setLinkDialog(false);
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setImageDialog(false);
    }
  };

  const addVideo = () => {
    if (videoUrl) {
      editor.chain().focus().setYoutubeVideo({ src: videoUrl }).run();
      setVideoUrl("");
      setVideoDialog(false);
    }
  };

  const toggleHtmlMode = () => {
    if (!editor) return;

    if (!isHtmlMode) {
      // Switching TO HTML mode - get current HTML
      setHtmlContent(editor.getHTML());
    } else {
      // Switching FROM HTML mode - sanitize and set content
      const sanitized = DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span', 'div'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel'],
        ALLOW_DATA_ATTR: false,
      });
      editor.commands.setContent(sanitized);
      onChange(sanitized);
    }
    setIsHtmlMode(!isHtmlMode);
  };

  const handleHtmlChange = (newHtml: string) => {
    setHtmlContent(newHtml);
  };

  // Sync htmlContent when editor content changes in visual mode
  useEffect(() => {
    if (editor && !isHtmlMode) {
      setHtmlContent(editor.getHTML());
    }
  }, [editor?.getHTML(), isHtmlMode]);

  return (
    <div className="border rounded-lg">
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1">
        <Button
          type="button"
          variant={isHtmlMode ? "default" : "ghost"}
          size="sm"
          onClick={toggleHtmlMode}
          className="mr-2"
        >
          {isHtmlMode ? <Eye className="h-4 w-4 mr-2" /> : <Code className="h-4 w-4 mr-2" />}
          {isHtmlMode ? "Vizual" : "HTML"}
        </Button>
        
        {!isHtmlMode && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive("bold") ? "bg-muted" : ""}
            >
              <Bold className="h-4 w-4" />
            </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-muted" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-muted" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-muted" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setLinkDialog(true)}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setImageDialog(true)}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setVideoDialog(true)}
        >
          <YoutubeIcon className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Editor - Visual or HTML Mode */}
      {isHtmlMode ? (
        <Textarea
          value={htmlContent}
          onChange={(e) => handleHtmlChange(e.target.value)}
          placeholder="<p>Scrie HTML aici... CSS inline este permis.</p>"
          className="min-h-[400px] font-mono text-sm p-4 rounded-none border-0 focus-visible:ring-0"
        />
      ) : (
        <EditorContent editor={editor} />
      )}

      {/* Dialogs */}
      <Dialog open={linkDialog} onOpenChange={setLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă Link</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLinkDialog(false)}>
              Anulează
            </Button>
            <Button onClick={addLink}>Adaugă</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={imageDialog} onOpenChange={setImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă Imagine</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="URL imagine"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setImageDialog(false)}>
              Anulează
            </Button>
            <Button onClick={addImage}>Adaugă</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={videoDialog} onOpenChange={setVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă Video YouTube</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="URL YouTube"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setVideoDialog(false)}>
              Anulează
            </Button>
            <Button onClick={addVideo}>Adaugă</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
