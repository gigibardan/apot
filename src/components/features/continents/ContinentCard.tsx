import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Continent } from "@/types/database.types";

interface ContinentCardProps {
  continent: Continent;
  objectiveCount?: number;
  className?: string;
}

// Unsplash images for each continent (optimized for cards)
const continentImages: Record<string, string> = {
  europa: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&q=80", // European architecture
  asia: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&q=80", // Asian temple
  africa: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80", // African safari
  "america-de-nord": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=600&q=80", // NYC skyline
  "america-de-sud": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=80", // Rio
  oceania: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&q=80", // Sydney Opera
  antarctica: "https://images.unsplash.com/photo-1551415923-a2297c7fda79?w=600&q=80", // Ice landscape
};

/**
 * ContinentCard Component
 * Interactive card for continent navigation with subtle background images
 * Links to objectives filtered by continent
 */
export function ContinentCard({
  continent,
  objectiveCount = 0,
  className,
}: ContinentCardProps) {
  const backgroundImage = continentImages[continent.slug] || continent.image_url;

  return (
    <Link
      to={`/obiective?continent=${continent.slug}`}
      className="group block"
      aria-label={`Explorează obiective turistice din ${continent.name}`}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          "hover:shadow-xl hover:-translate-y-1",
          "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
          "min-h-[200px]",
          className
        )}
      >
        {/* Background Image Layer */}
        {backgroundImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        )}
        
        {/* Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/70 to-background/40 dark:from-background/98 dark:via-background/80 dark:to-background/50" />
        
        {/* Blur/Glass effect layer */}
        <div className="absolute inset-0 backdrop-blur-[2px] group-hover:backdrop-blur-[1px] transition-all duration-300" />

        {/* Content */}
        <div className="relative p-6 space-y-4 z-10">
          {/* Icon */}
          <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-primary/20 backdrop-blur-sm border border-primary/20 group-hover:bg-primary/30 group-hover:border-primary/30 transition-all duration-300">
            <MapPin className="w-7 h-7 text-primary" />
          </div>

          {/* Content */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-display font-bold tracking-tight group-hover:text-primary transition-colors drop-shadow-sm">
              {continent.name}
            </h3>
            
            {continent.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 drop-shadow-sm">
                {continent.description}
              </p>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
              <MapPin className="w-4 h-4" />
              <span className="drop-shadow-sm">
                {objectiveCount > 0
                  ? `${objectiveCount} obiective`
                  : "Explorează"}
              </span>
            </div>
          </div>

          {/* Hover Glow Effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at center, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
            }}
          />
        </div>
      </Card>
    </Link>
  );
}
