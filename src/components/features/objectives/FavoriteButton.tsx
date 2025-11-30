import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isFavorited } from "@/lib/supabase/queries/favorites";
import { toggleFavorite } from "@/lib/supabase/mutations/favorites";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface FavoriteButtonProps {
  objectiveId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  className?: string;
}

export function FavoriteButton({
  objectiveId,
  variant = "ghost",
  size = "icon",
  showLabel = false,
  className,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [objectiveId, user]);

  const checkFavoriteStatus = async () => {
    try {
      const status = await isFavorited(objectiveId);
      setFavorited(status);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/auth/login");
      return;
    }

    setLoading(true);
    try {
      await toggleFavorite(objectiveId, favorited);
      setFavorited(!favorited);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "transition-all duration-200",
        favorited && "text-destructive hover:text-destructive",
        className
      )}
      aria-label={favorited ? "Elimină din favorite" : "Adaugă la favorite"}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all",
          favorited && "fill-current"
        )}
      />
      {showLabel && (
        <span className="ml-2">
          {favorited ? "Salvat" : "Salvează"}
        </span>
      )}
    </Button>
  );
}
