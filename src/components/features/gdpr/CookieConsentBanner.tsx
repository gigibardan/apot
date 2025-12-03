import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCookieConsent, CookiePreferences } from '@/hooks/useCookieConsent';
import { cn } from '@/lib/utils';

export function CookieConsentBanner() {
  const {
    showBanner,
    preferences,
    acceptAll,
    acceptNecessary,
    savePreferences,
    setShowBanner,
  } = useCookieConsent();

  const [showSettings, setShowSettings] = useState(false);
  const [tempPreferences, setTempPreferences] = useState<CookiePreferences>(preferences);

  if (!showBanner) return null;

  const handleSavePreferences = () => {
    savePreferences(tempPreferences);
    setShowSettings(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="relative rounded-xl border bg-background/95 backdrop-blur-md shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={() => setShowBanner(false)}
            className="absolute right-3 top-3 p-1 rounded-md hover:bg-muted transition-colors"
            aria-label="Închide"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="p-4 md:p-6">
            {!showSettings ? (
              // Main Banner
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Cookie className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1 pr-6">
                    <h3 className="font-semibold text-foreground">
                      Folosim cookie-uri 🍪
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Acest site folosește cookie-uri pentru a-ți oferi o experiență mai bună. 
                      Cookie-urile necesare sunt esențiale pentru funcționarea site-ului. 
                      Poți alege să accepți toate cookie-urile sau să le personalizezi.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <Link to="/cookies" className="hover:text-primary underline">
                      Politica Cookies
                    </Link>
                    <span>•</span>
                    <Link to="/politica-confidentialitate" className="hover:text-primary underline">
                      Confidențialitate
                    </Link>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTempPreferences(preferences);
                        setShowSettings(true);
                      }}
                      className="gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Personalizează
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={acceptNecessary}
                    >
                      Doar necesare
                    </Button>
                    <Button
                      size="sm"
                      onClick={acceptAll}
                    >
                      Accept toate
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Settings Panel
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-1 rounded-md hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <h3 className="font-semibold text-foreground">
                    Setări Cookie-uri
                  </h3>
                </div>

                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                  {/* Necessary Cookies */}
                  <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="space-y-1">
                      <Label className="font-medium">Cookie-uri necesare</Label>
                      <p className="text-xs text-muted-foreground">
                        Esențiale pentru funcționarea site-ului. Nu pot fi dezactivate.
                      </p>
                    </div>
                    <Switch checked disabled className="data-[state=checked]:bg-primary" />
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start justify-between gap-4 p-3 rounded-lg border">
                    <div className="space-y-1">
                      <Label className="font-medium">Cookie-uri analitice</Label>
                      <p className="text-xs text-muted-foreground">
                        Ne ajută să înțelegem cum este folosit site-ul pentru a-l îmbunătăți.
                      </p>
                    </div>
                    <Switch
                      checked={tempPreferences.analytics}
                      onCheckedChange={(checked) =>
                        setTempPreferences({ ...tempPreferences, analytics: checked })
                      }
                    />
                  </div>

                  {/* Functional Cookies */}
                  <div className="flex items-start justify-between gap-4 p-3 rounded-lg border">
                    <div className="space-y-1">
                      <Label className="font-medium">Cookie-uri funcționale</Label>
                      <p className="text-xs text-muted-foreground">
                        Permit funcționalități avansate precum preferințe de limbă și temă.
                      </p>
                    </div>
                    <Switch
                      checked={tempPreferences.functional}
                      onCheckedChange={(checked) =>
                        setTempPreferences({ ...tempPreferences, functional: checked })
                      }
                    />
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start justify-between gap-4 p-3 rounded-lg border">
                    <div className="space-y-1">
                      <Label className="font-medium">Cookie-uri de marketing</Label>
                      <p className="text-xs text-muted-foreground">
                        Folosite pentru a afișa reclame relevante pe alte site-uri.
                      </p>
                    </div>
                    <Switch
                      checked={tempPreferences.marketing}
                      onCheckedChange={(checked) =>
                        setTempPreferences({ ...tempPreferences, marketing: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(false)}
                  >
                    Anulează
                  </Button>
                  <Button size="sm" onClick={handleSavePreferences}>
                    Salvează preferințele
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
