import { Link } from "react-router-dom";
import { Home, MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo/SEO";

/**
 * 404 Not Found Page
 * Friendly error page with navigation back home
 */
export default function NotFound() {
  return (
    <>
      <SEO
        title="404 - Pagina nu a fost găsită"
        description="Ne pare rău, pagina pe care o cauți nu există."
        noindex={true}
      />
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/50 to-background">
        <div className="text-center space-y-8 px-4 max-w-md">
          <div className="flex justify-center">
            <div className="relative">
              <MapPinOff className="h-24 w-24 text-primary animate-pulse" />
              <div className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
                404
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-display font-bold tracking-tight">
              Pagina nu a fost găsită
            </h1>
            <p className="text-lg text-muted-foreground">
              Ne pare rău, pagina pe care o cauți nu există sau a fost mutată.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/">
                <Home className="mr-2 h-5 w-5" />
                Înapoi la Prima Pagină
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
