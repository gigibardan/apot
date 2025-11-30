import { memo } from "react";
import { Link } from "react-router-dom";
import { MapPin, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "./FavoriteButton";
import type { ObjectiveWithRelations } from "@/types/database.types";

interface ObjectiveCardProps {
  objective: ObjectiveWithRelations;
  variant?: "default" | "compact";
  showExcerpt?: boolean;
  className?: string;
}

/**
 * ObjectiveCard Component
 * Reusable card for displaying tourist objectives
 * Used across homepage, listings, and search results
 */
function ObjectiveCardComponent({
  objective,
  variant = "default",
  showExcerpt = true,
  className,
}: ObjectiveCardProps) {
  const primaryType = objective.types?.[0];

  return (
    <Link
      to={`/obiective/${objective.slug}`}
      className="group block h-full"
      aria-label={`Descoperă ${objective.title}`}
    >
      <Card
        className={cn(
          "h-full overflow-hidden transition-all duration-300",
          "hover:shadow-xl hover:-translate-y-1",
          "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
          className
        )}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {objective.featured_image ? (
            <img
              src={objective.featured_image}
              alt={objective.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <MapPin className="w-16 h-16 text-muted-foreground" />
            </div>
          )}

          {/* UNESCO Badge */}
          {objective.unesco_site && (
            <Badge
              className="absolute top-3 left-3 bg-yellow-500 dark:bg-yellow-600 text-white border-0"
              aria-label="Sit UNESCO"
            >
              <Award className="w-3 h-3 mr-1" />
              UNESCO
            </Badge>
          )}

          {/* Favorite Button */}
          <div className="absolute top-3 right-3">
            <FavoriteButton
              objectiveId={objective.id}
              variant="ghost"
              className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
            />
          </div>

          {/* Type Badge - moved to bottom right */}
          {primaryType && (
            <Badge
              className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm"
              style={{
                backgroundColor: primaryType.color
                  ? `${primaryType.color}20`
                  : undefined,
                color: primaryType.color || undefined,
              }}
            >
              {primaryType.name}
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className={cn("p-5 space-y-3", variant === "compact" && "p-4 space-y-2")}>
          {/* Location */}
          {objective.country && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-base" aria-hidden="true">
                {objective.country.flag_emoji || "🌍"}
              </span>
              <span>{objective.country.name}</span>
            </div>
          )}

          {/* Title */}
          <h3
            className={cn(
              "font-display font-bold tracking-tight line-clamp-2 group-hover:text-primary transition-colors",
              variant === "compact" ? "text-lg" : "text-xl"
            )}
          >
            {objective.title}
          </h3>

          {/* Excerpt */}
          {showExcerpt && objective.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {objective.excerpt}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// Memoize component for performance optimization
export const ObjectiveCard = memo(ObjectiveCardComponent);
