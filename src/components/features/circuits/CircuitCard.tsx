import { ExternalLink, MapPin, Clock, Euro } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { JinfoursCircuit } from "@/types/database.types";

interface CircuitCardProps {
  circuit: JinfoursCircuit;
  onCtaClick?: (circuitId: string) => void;
  className?: string;
}

/**
 * CircuitCard Component
 * Display Jinfotours partner circuits with commercial styling
 * Tracks clicks for affiliate analytics
 */
export function CircuitCard({
  circuit,
  onCtaClick,
  className,
}: CircuitCardProps) {
  const handleClick = () => {
    if (onCtaClick) {
      onCtaClick(circuit.id);
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1",
        "border-2 border-accent/20 dark:border-accent/30",
        "bg-gradient-to-br from-background to-accent/5",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {circuit.thumbnail_url ? (
          <>
            <img
              src={circuit.thumbnail_url}
              alt={circuit.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/10 to-accent/20">
            <MapPin className="w-16 h-16 text-muted-foreground" />
          </div>
        )}

        {/* Featured Badge */}
        {circuit.featured && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground border-0">
            Circuit Organizat
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-5 space-y-4">
        {/* Title */}
        <h3 className="text-xl font-display font-bold tracking-tight line-clamp-2">
          {circuit.title}
        </h3>

        {/* Description */}
        {circuit.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {circuit.description}
          </p>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          {/* Countries */}
          {circuit.countries && circuit.countries.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>Destinație</span>
              </div>
              <span className="text-sm font-medium truncate">
                {circuit.countries[0]}
                {circuit.countries.length > 1 && ` +${circuit.countries.length - 1}`}
              </span>
            </div>
          )}

          {/* Duration */}
          {circuit.duration_days && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Durată</span>
              </div>
              <span className="text-sm font-medium">
                {circuit.duration_days} zile
              </span>
            </div>
          )}

          {/* Price */}
          {circuit.price_from && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Euro className="w-3 h-3" />
                <span>De la</span>
              </div>
              <span className="text-sm font-medium">
                {circuit.price_from}€
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {/* CTA */}
      <CardFooter className="p-5 pt-0">
        <Button
          asChild
          variant="default"
          className="w-full bg-accent hover:bg-accent/90"
          onClick={handleClick}
        >
          <a
            href={circuit.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <span>Vezi pe Jinfotours</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
