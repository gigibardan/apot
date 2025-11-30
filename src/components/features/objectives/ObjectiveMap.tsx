import { Button } from "@/components/ui/button";
import { ExternalLink, Navigation } from "lucide-react";

interface ObjectiveMapProps {
  latitude: number;
  longitude: number;
  title: string;
  locationText?: string;
}

export function ObjectiveMap({ latitude, longitude, title, locationText }: ObjectiveMapProps) {
  const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const embedUrl = `https://www.google.com/maps?q=${latitude},${longitude}&output=embed&z=14`;

  return (
    <div className="space-y-4">
      {/* Map Embed */}
      <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-lg">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Harta pentru ${title}`}
          className="w-full h-full"
        />
      </div>

      {/* Location Info */}
      <div className="space-y-3">
        {locationText && (
          <p className="text-muted-foreground">{locationText}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Coordonate: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="default">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Deschide în Google Maps
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="w-4 h-4 mr-2" />
              Obține Indicații
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
