"use client";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, Heart } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/Container";
import { PUBLIC_ROUTES } from "@/lib/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import { getFavoritesCount } from "@/lib/supabase/queries/favorites";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Acasă", href: PUBLIC_ROUTES.home },
  { name: "Obiective", href: PUBLIC_ROUTES.objectives },
  { name: "Ghizi", href: PUBLIC_ROUTES.guides },
  { name: "Blog", href: PUBLIC_ROUTES.blog },
  { name: "Despre", href: PUBLIC_ROUTES.about },
  { name: "Contact", href: PUBLIC_ROUTES.contact },
];

/**
 * Header Component
 * Sticky navigation with mobile menu and theme toggle
 * Includes backdrop blur effect on scroll
 */
export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      loadFavoritesCount();
    } else {
      setFavoritesCount(0);
    }
  }, [user, pathname]);

  const loadFavoritesCount = async () => {
    try {
      const count = await getFavoritesCount();
      setFavoritesCount(count);
    } catch (error) {
      console.error("Error loading favorites count:", error);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-md shadow-sm"
          : "bg-background"
      )}
    >
      <Container>
        <nav
          className="flex items-center justify-between py-4"
          aria-label="Navigation principală"
        >
          {/* Logo */}
          <Link
            to={PUBLIC_ROUTES.home}
            className="flex items-center space-x-2 text-2xl font-display font-bold text-primary hover:opacity-90 transition-opacity"
          >
            <span>APOT</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-primary"
                    : "text-foreground/80"
                )}
              >
                {item.name}
              </Link>
            ))}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/favorite")}
                className="relative"
              >
                <Heart className="h-4 w-4 mr-2" />
                Favorite
                {favoritesCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {favoritesCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>

          {/* Theme Toggle & Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Schimbă tema"
              className="hidden md:flex"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Deschide meniu"
              className="md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </nav>
      </Container>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t animate-fade-in">
          <Container>
            <div className="py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 text-base font-medium rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}

              {user && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/favorite");
                  }}
                  className="flex w-full items-center justify-between px-4 py-3 text-base font-medium text-foreground/80 hover:bg-muted rounded-md transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Favorite
                  </span>
                  {favoritesCount > 0 && (
                    <Badge variant="destructive" className="h-5 px-2 text-xs">
                      {favoritesCount}
                    </Badge>
                  )}
                </button>
              )}

              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex w-full items-center justify-between px-4 py-3 text-base font-medium text-foreground/80 hover:bg-muted rounded-md transition-colors"
              >
                <span>Temă</span>
                {theme === "dark" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
