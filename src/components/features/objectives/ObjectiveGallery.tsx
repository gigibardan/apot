import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Button } from "@/components/ui/button";
import { Images } from "lucide-react";
import type { GalleryImage } from "@/types/database.types";

interface ObjectiveGalleryProps {
  images: GalleryImage[];
  objectiveTitle: string;
}

export function ObjectiveGallery({ images, objectiveTitle }: ObjectiveGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="bg-muted/50 rounded-lg p-12 text-center">
        <Images className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Mai multe fotografii vor fi adăugate în curând</p>
      </div>
    );
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Convert GalleryImage[] to lightbox slides format
  const lightboxSlides = images.map((img) => ({ 
    src: img.url, 
    alt: img.alt 
  }));

  // If only 1 image, show it large
  if (images.length === 1) {
    return (
      <>
        <div
          onClick={() => openLightbox(0)}
          className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
        >
          <img
            src={images[0].url}
            alt={images[0].alt || objectiveTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              Vezi Fotografia
            </span>
          </div>
        </div>
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={lightboxSlides}
          index={lightboxIndex}
        />
      </>
    );
  }

  // Grid layout for multiple images
  const displayImages = images.slice(0, 5);
  const hasMore = images.length > 5;

  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        {/* First image - large (2x2) */}
        <div
          onClick={() => openLightbox(0)}
          className="col-span-4 sm:col-span-2 sm:row-span-2 relative aspect-video sm:aspect-square rounded-lg overflow-hidden cursor-pointer group"
        >
          <img
            src={displayImages[0].url}
            alt={displayImages[0].alt || `${objectiveTitle} - Imagine 1`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              Vezi Fotografia
            </span>
          </div>
        </div>

        {/* Next 4 images - small (1x1) */}
        {displayImages.slice(1, 5).map((img, idx) => (
          <div
            key={idx}
            onClick={() => openLightbox(idx + 1)}
            className="col-span-2 sm:col-span-1 relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
          >
            <img
              src={img.url}
              alt={img.alt || `${objectiveTitle} - Imagine ${idx + 2}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                Vezi
              </span>
            </div>
            {/* Show "+X more" on last image if more exist */}
            {hasMore && idx === 3 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">+{images.length - 5}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <Button
          onClick={() => openLightbox(0)}
          variant="outline"
          className="w-full mt-4"
          size="lg"
        >
          <Images className="w-4 h-4 mr-2" />
          Vezi Toate Fotografiile ({images.length})
        </Button>
      )}

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
      />
    </>
  );
}
