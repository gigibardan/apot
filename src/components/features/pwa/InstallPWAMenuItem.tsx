import { useState, useEffect } from "react";
import { Smartphone, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWAMenuItem({ onInstallClick }: { onInstallClick?: () => void }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const checkInstalled = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkInstalled();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error("Error during PWA installation:", error);
    } finally {
      setIsInstalling(false);
    }

    onInstallClick?.();
  };

  // Don't render if already installed or prompt not available
  if (isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      disabled={isInstalling}
      className="w-full flex items-center gap-3 px-4 py-3 border-t border-border mt-3 pt-4 hover:bg-primary/5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50"
      aria-label="Instalează aplicația APOT pe telefon"
    >
      {/* Icon circular stânga */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Smartphone className="h-5 w-5 text-primary" />
      </div>
      
      {/* Text centru */}
      <div className="flex-1 text-left">
        <div className="text-base font-semibold text-foreground">
          {isInstalling ? "Se instalează..." : "Instalează Aplicația"}
        </div>
        <div className="text-sm text-muted-foreground">
          Acces rapid pe telefon
        </div>
      </div>
      
      {/* Icon download dreapta */}
      <div className="flex-shrink-0">
        <Download className="h-5 w-5 text-primary" />
      </div>
    </button>
  );
}
