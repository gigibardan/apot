import { ExternalLink, MapPin, Clock, Euro, TrendingDown } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackJinfoursClick } from "@/lib/supabase/queries/jinfotours";
import type { JinfoursCircuit } from "@/types/database.types";

interface CircuitCardProps {
  circuit: JinfoursCircuit;
  onCtaClick?: (circuitId: string) => void;
  className?: string;
}

/**
 * Check if discount is still valid
 */
function isDiscountValid(discountUntil?: string | null): boolean {
  if (!discountUntil) return false;
  return new Date(discountUntil) > new Date();
}

/**
 * CircuitCard Component
 * Display Jinfotours partner circuits with commercial styling
 * Tracks clicks for affiliate analytics and shows promotional badges
 */
export function CircuitCard({
  circuit,
  onCtaClick,
  className,
}: CircuitCardProps) {
  const hasDiscount = circuit.discount_percentage && circuit.discount_percentage > 0 && isDiscountValid(circuit.discount_until);
  const finalPrice = hasDiscount && circuit.original_price
    ? circuit.original_price * (1 - circuit.discount_percentage / 100)
    : circuit.price_from;

  const handleClick = async () => {
    // Track click
    await trackJinfoursClick(circuit.id, {
      sourceUrl: window.location.href,
    });

    // Call optional callback
    if (onCtaClick) {
      onCtaClick(circuit.id);
    }

    // Open external link
    window.open(circuit.external_url, "_blank", "noopener,noreferrer");
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

        {/* Badges - Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {circuit.featured && (
            <Badge className="bg-accent text-accent-foreground border-0">
              Circuit Organizat
            </Badge>
          )}
          {circuit.badge_text && (
            <Badge 
              style={{
                backgroundColor: circuit.badge_color === 'destructive' ? 'hsl(var(--destructive))' : 
                                circuit.badge_color === 'secondary' ? 'hsl(var(--secondary))' : 
                                'hsl(var(--accent))',
                color: 'hsl(var(--accent-foreground))'
              }}
            >
              {circuit.badge_text}
            </Badge>
          )}
        </div>

        {/* Discount Badge - Top Right */}
        {hasDiscount && (
          <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            -{circuit.discount_percentage}%
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
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Euro className="w-3 h-3" />
              <span>De la</span>
            </div>
            {hasDiscount && circuit.original_price ? (
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground line-through">
                  {circuit.original_price}€
                </span>
                <span className="text-sm font-bold text-destructive">
                  {finalPrice?.toFixed(0)}€
                </span>
              </div>
            ) : (
              <span className="text-sm font-medium">
                {circuit.price_from}€
              </span>
            )}
          </div>
        </div>

        {/* Discount validity */}
        {hasDiscount && circuit.discount_until && (
          <p className="text-xs text-destructive pt-2 border-t">
            ⏰ Ofertă valabilă până la {new Date(circuit.discount_until).toLocaleDateString('ro-RO', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        )}
      </CardContent>

      {/* CTA */}
      <CardFooter className="p-5 pt-0">
        <Button
          variant="default"
          className="w-full bg-accent hover:bg-accent/90"
          onClick={handleClick}
        >
          <span>Vezi pe Jinfotours</span>
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}
