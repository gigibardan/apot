import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PUBLIC_ROUTES } from "@/lib/constants/routes";
import { siteConfig } from "@/lib/config/site.config";

/**
 * Footer Component
 * Site-wide footer with navigation, social links, and newsletter
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <Container>
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* About Column */}
            <div className="space-y-4">
              <h3 className="text-lg font-display font-semibold">
                Despre APOT
              </h3>
              <p className="text-sm text-muted-foreground">
                {siteConfig.fullName} - Descoperă cele mai frumoase obiective
                turistice din întreaga lume.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hover:text-primary"
                >
                  <a
                    href={siteConfig.links.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hover:text-primary"
                >
                  <a
                    href={siteConfig.links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hover:text-primary"
                >
                  <a
                    href={siteConfig.links.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Quick Links Column */}
            <div className="space-y-4">
              <h3 className="text-lg font-display font-semibold">
                Link-uri Rapide
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to={PUBLIC_ROUTES.objectives}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Obiective Turistice
                  </Link>
                </li>
                <li>
                  <Link
                    to={PUBLIC_ROUTES.blog}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to={PUBLIC_ROUTES.about}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Despre Noi
                  </Link>
                </li>
                <li>
                  <Link
                    to={PUBLIC_ROUTES.contact}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="space-y-4">
              <h3 className="text-lg font-display font-semibold">Resurse</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href={siteConfig.links.jinfotours}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Circuite Turistice Jinfotours
                  </a>
                </li>
                <li>
                  <Link
                    to="/politica-confidentialitate"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Politică Confidențialitate
                  </Link>
                </li>
                <li>
                  <Link
                    to="/termeni-conditii"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Termeni și Condiții
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cookies"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Politică Cookies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="space-y-4">
              <h3 className="text-lg font-display font-semibold">Newsletter</h3>
              <p className="text-sm text-muted-foreground">
                Abonează-te pentru cele mai noi obiective turistice.
              </p>
              <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
                <Input
                  type="email"
                  placeholder="Email-ul tău"
                  disabled
                  aria-label="Email pentru newsletter"
                />
                <Button type="submit" className="w-full" disabled>
                  <Mail className="mr-2 h-4 w-4" />
                  Abonează-te
                </Button>
                <p className="text-xs text-muted-foreground">
                  Coming soon - În curând disponibil
                </p>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              © {currentYear} {siteConfig.name}. Toate drepturile rezervate.
            </p>
            <p className="mt-2">
              Dezvoltat cu ❤️ pentru iubitorii de călătorii
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
