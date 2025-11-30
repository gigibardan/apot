import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackJinfoursClick } from "@/lib/analytics/events";

interface MobileStickyCTAProps {
  countryName: string;
}

export function MobileStickyCTA({ countryName }: MobileStickyCTAProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling 300px down
      setIsScrolled(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    trackJinfoursClick("mobile-sticky-cta", countryName, "bottom-bar");
    window.open("https://jinfotours.ro", "_blank", "noopener,noreferrer");
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || !isScrolled) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 md:hidden",
        "bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700",
        "shadow-lg border-t border-orange-400/20",
        "animate-in slide-in-from-bottom duration-300"
      )}
    >
      <div className="container flex items-center justify-between gap-3 py-3 px-4">
        <div className="flex-1">
          <p className="text-white text-sm font-medium">
            Călătorește Organizat în {countryName}
          </p>
        </div>
        <Button
          onClick={handleClick}
          size="sm"
          variant="secondary"
          className="bg-white text-orange-600 hover:bg-orange-50 font-semibold"
        >
          Vezi Circuite
        </Button>
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
