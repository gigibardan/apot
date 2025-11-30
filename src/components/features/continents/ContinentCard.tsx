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

/**
 * ContinentCard Component
 * Interactive card for continent navigation
 * Links to objectives filtered by continent
 */
export function ContinentCard({
  continent,
  objectiveCount = 0,
  className,
}: ContinentCardProps) {
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
          "bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10",
          "dark:from-primary/10 dark:via-accent/10 dark:to-primary/20",
          className
        )}
      >
        <div className="p-6 space-y-4">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
            <MapPin className="w-8 h-8 text-primary" />
          </div>

          {/* Content */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-display font-bold tracking-tight group-hover:text-primary transition-colors">
              {continent.name}
            </h3>
            
            {continent.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {continent.description}
              </p>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
              <MapPin className="w-4 h-4" />
              <span>
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
                "radial-gradient(circle at center, hsl(var(--primary) / 0.1) 0%, transparent 70%)",
            }}
          />
        </div>
      </Card>
    </Link>
  );
}
