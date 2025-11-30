import { useState } from "react";
import { Search, Image as ImageIcon, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  user: {
    name: string;
    username: string;
  };
  description: string | null;
  alt_description: string | null;
}

interface ImageSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imageUrl: string, attribution?: string) => void;
  initialQuery?: string;
}

export function ImageSearchModal({
  open,
  onOpenChange,
  onSelect,
  initialQuery = ""
}: ImageSearchModalProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState(initialQuery);
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);

  // Note: In production, this should be an edge function call
  const searchImages = async () => {
    if (!query.trim()) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Introduceți un termen de căutare"
      });
      return;
    }

    setLoading(true);
    
    try {
      // This is a placeholder - needs actual Unsplash API implementation
      // Should be done via edge function to keep API key secure
      toast({
        title: "Notă",
        description: "Integrarea Unsplash necesită configurarea API key în setări."
      });
      
      // Mock data for demonstration
      const mockImages: UnsplashImage[] = [
        {
          id: "1",
          urls: {
            small: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400",
            regular: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1080",
            full: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=2400"
          },
          user: {
            name: "Demo User",
            username: "demouser"
          },
          description: "Beautiful landscape",
          alt_description: "mountain landscape"
        }
      ];
      
      setImages(mockImages);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu am putut căuta imaginile"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = async (image: UnsplashImage) => {
    setSelectedImage(image);
    
    // In production, this would:
    // 1. Download the image from Unsplash
    // 2. Upload to Supabase Storage
    // 3. Return the Supabase URL
    
    onSelect(
      image.urls.regular,
      `Photo by ${image.user.name} on Unsplash`
    );
    
    toast({
      title: "Imagine selectată",
      description: "Imaginea a fost adăugată în formular."
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Caută Imagini pe Unsplash
          </DialogTitle>
          <DialogDescription>
            Găsește și importă imagini gratuite de înaltă calitate
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ex: castle romania, mountains, beach sunset..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchImages()}
                className="pl-10"
              />
            </div>
            <Button onClick={searchImages} disabled={loading}>
              {loading ? "Se caută..." : "Caută"}
            </Button>
          </div>

          {images.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Caută imagini pentru a începe</p>
              <p className="text-sm mt-2">
                Toate imaginile sunt gratuite de folosit conform licenței Unsplash
              </p>
            </div>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border hover:border-primary transition-colors"
                  onClick={() => handleSelectImage(image)}
                >
                  <img
                    src={image.urls.small}
                    alt={image.alt_description || "Unsplash image"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div className="text-white text-sm">
                      <p className="font-medium">{image.user.name}</p>
                      <a
                        href={`https://unsplash.com/@${image.user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs opacity-75 hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        @{image.user.username}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-muted-foreground border-t pt-4">
            <p>
              <strong>Notă:</strong> Pentru a activa căutarea Unsplash, configurează API key-ul în setările admin.
              Toate imaginile includ atribuire automată pentru fotograful original.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
