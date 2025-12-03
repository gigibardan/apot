import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, Heart, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Container } from "@/components/layout/Container";
import { PUBLIC_ROUTES } from "@/lib/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import { getFavoritesCount } from "@/lib/supabase/queries/favorites";
import { NotificationBell } from "@/components/features/forum/NotificationBell";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  const navigation = [
    { name: t("nav.home"), href: PUBLIC_ROUTES.home },
    { name: t("nav.objectives"), href: PUBLIC_ROUTES.objectives },
    { name: t("nav.guides"), href: PUBLIC_ROUTES.guides },
    { name: t("nav.blog"), href: PUBLIC_ROUTES.blog },
    { name: t("nav.about"), href: PUBLIC_ROUTES.about },
    { name: t("nav.contact"), href: PUBLIC_ROUTES.contact },
  ];

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

  const handleLogout = async () => {
    await signOut();
    navigate("/");
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
            
            {/* Community Dropdown - Desktop Only */}
            <div className="relative group">
              <button className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1">
                Community
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-background border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link to="/feed" className="block px-4 py-2 text-sm hover:bg-muted">Activity Feed</Link>
                <Link to="/forum" className="block px-4 py-2 text-sm hover:bg-muted">Forum</Link>
                <Link to="/journals" className="block px-4 py-2 text-sm hover:bg-muted">Travel Journals</Link>
                <Link to="/contests" className="block px-4 py-2 text-sm hover:bg-muted">Photo Contests</Link>
                <Link to="/challenges" className="block px-4 py-2 text-sm hover:bg-muted">Challenges</Link>
                <Link to="/leaderboards" className="block px-4 py-2 text-sm hover:bg-muted">Leaderboards</Link>
                <Link to="/suggest-objective" className="block px-4 py-2 text-sm hover:bg-muted border-t">Sugerează Obiectiv</Link>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/favorite")}
              className="relative"
            >
              <Heart className="h-4 w-4 mr-2" />
              {t("nav.favorites")}
              {favoritesCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {favoritesCount}
                </Badge>
              )}
            </Button>

            {/* Auth - Desktop */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    Contul meu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Deconectare
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth/login")}
                >
                  Autentificare
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/auth/signup")}
                >
                  Înregistrare
                </Button>
              </>
            )}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-2">
            {user && <NotificationBell />}
            <LanguageSwitcher />
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 top-[73px] z-40 bg-background/60 backdrop-blur-md md:hidden overflow-y-auto overscroll-contain"
        >
          {/* Scrollable menu content */}
          <div className="min-h-full">
            <Container>
              <div className="py-4 space-y-2">
                {/* Auth Buttons Mobile - At Top */}
                {user ? (
                  <div className="flex items-center justify-between px-4 py-3 bg-background/80 rounded-md mb-4">
                    <span className="text-sm font-medium">Bine ai venit!</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate("/dashboard");
                        }}
                      >
                        <User className="h-4 w-4 mr-1" />
                        Dashboard
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 px-4 py-3 bg-background/80 rounded-md mb-4">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/auth/login");
                      }}
                    >
                      Autentificare
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/auth/signup");
                      }}
                    >
                      Înregistrare
                    </Button>
                  </div>
                )}

                {/* Theme Toggle - Mobile */}
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex w-full items-center justify-between px-4 py-3 text-base font-medium text-foreground/80 hover:bg-background/80 rounded-md transition-colors"
                >
                  <span>{theme === "dark" ? "Mod luminos" : "Mod întunecat"}</span>
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>

                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block px-4 py-3 text-base font-medium rounded-md transition-colors",
                      pathname === item.href
                        ? "bg-primary/20 text-primary"
                        : "text-foreground/80 hover:bg-background/80 hover:text-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Favorites - Mobile */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/favorite");
                  }}
                  className="flex w-full items-center justify-between px-4 py-3 text-base font-medium text-foreground/80 hover:bg-background/80 rounded-md transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    {t("nav.favorites")}
                  </span>
                  {favoritesCount > 0 && (
                    <Badge variant="destructive" className="h-5 px-2 text-xs">
                      {favoritesCount}
                    </Badge>
                  )}
                </button>

                {/* Community Links - Mobile */}
                <div className="px-4 py-2 border-t border-foreground/10 mt-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Community</p>
                  <div className="space-y-1">
                    <Link
                      to="/feed"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-foreground/80 hover:bg-background/80 rounded-md"
                    >
                      Activity Feed
                    </Link>
                    <Link
                      to="/forum"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-foreground/80 hover:bg-background/80 rounded-md"
                    >
                      Forum
                    </Link>
                    <Link
                      to="/journals"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-foreground/80 hover:bg-background/80 rounded-md"
                    >
                      Travel Journals
                    </Link>
                    <Link
                      to="/contests"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-foreground/80 hover:bg-background/80 rounded-md"
                    >
                      Photo Contests
                    </Link>
                    <Link
                      to="/challenges"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-foreground/80 hover:bg-background/80 rounded-md"
                    >
                      Challenges
                    </Link>
                    <Link
                      to="/leaderboards"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-foreground/80 hover:bg-background/80 rounded-md"
                    >
                      Leaderboards
                    </Link>
                    <Link
                      to="/suggest-objective"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-foreground/80 hover:bg-background/80 rounded-md border-t border-foreground/10 mt-2 pt-2"
                    >
                      Sugerează Obiectiv
                    </Link>
                  </div>
                </div>
                
                {/* Bottom padding for safe area */}
                <div className="h-8" />
              </div>
            </Container>
          </div>
        </div>
      )}
    </header>
  );
}
