import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Facebook, Twitter, MessageCircle, Link2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  title: string;
  description?: string;
  url: string;
}

export function ShareButtons({ title, description, url }: ShareButtonsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        console.log("📊 Share successful");
      } catch (err) {
        // User cancelled or error
        console.log("Share cancelled");
      }
    }
  };

  const shareToFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=400");
    console.log("📊 Share to Facebook");
  };

  const shareToTwitter = () => {
    const text = `${title}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=400");
    console.log("📊 Share to Twitter");
  };

  const shareToWhatsApp = () => {
    const text = `${title} - ${url}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    console.log("📊 Share to WhatsApp");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copiat! ✓",
        description: "Link-ul a fost copiat în clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
      console.log("📊 Link copied");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu am putut copia link-ul",
      });
    }
  };

  // Check if native share is supported
  const hasNativeShare = typeof navigator !== "undefined" && navigator.share;

  if (hasNativeShare) {
    return (
      <Button onClick={handleNativeShare} variant="outline" className="w-full" size="lg">
        <Share2 className="w-4 h-4 mr-2" />
        Distribuie Obiectivul
      </Button>
    );
  }

  // Fallback to share menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full" size="lg">
          <Share2 className="w-4 h-4 mr-2" />
          Distribuie Obiectivul
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={shareToFacebook}>
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTwitter}>
          <Twitter className="w-4 h-4 mr-2" />
          Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToWhatsApp}>
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink}>
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-500" />
              Link Copiat!
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4 mr-2" />
              Copiază Link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
