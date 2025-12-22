import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface JournalLikeButtonProps {
  journalId: string;
  initialLiked: boolean;
  initialCount: number;
  onLikeChange?: (liked: boolean, newCount: number) => void;
}

export function JournalLikeButton({
  journalId,
  initialLiked,
  initialCount,
  onLikeChange,
}: JournalLikeButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLike = async () => {
    if (!user) {
      toast({
        title: "Autentificare necesară",
        description: "Trebuie să fii autentificat pentru a aprecia un jurnal.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLiked) {
        // Unlike - remove from journal_likes
        const { error } = await supabase
          .from("journal_likes")
          .delete()
          .eq("journal_id", journalId)
          .eq("user_id", user.id);

        if (error) throw error;

        const newCount = Math.max(0, likeCount - 1);
        setIsLiked(false);
        setLikeCount(newCount);
        onLikeChange?.(false, newCount);

        toast({
          title: "Apreciere eliminată",
          description: "Ai eliminat aprecierea pentru acest jurnal.",
        });
      } else {
        // Like - add to journal_likes
        const { error } = await supabase
          .from("journal_likes")
          .insert({
            journal_id: journalId,
            user_id: user.id,
          });

        if (error) throw error;

        const newCount = likeCount + 1;
        setIsLiked(true);
        setLikeCount(newCount);
        onLikeChange?.(true, newCount);

        toast({
          title: "Jurnal apreciat!",
          description: "Ai apreciat cu succes acest jurnal de călătorie.",
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza aprecierea. Încearcă din nou.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size="sm"
      onClick={handleToggleLike}
      disabled={isLoading}
      className={cn(
        "gap-2 transition-all",
        isLiked && "bg-red-500 hover:bg-red-600 text-white"
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all",
          isLiked && "fill-current"
        )}
      />
      <span>{likeCount}</span>
    </Button>
  );
}