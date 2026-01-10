import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X, Sun, Moon, Heart, LogOut, User, Shield } from "lucide-react";
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
  const { user, signOut, isAdmin } = useAuth();
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

  // Auto-close menu on route change (UX improvement)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
        "sticky top-0 z-[100] w-full transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm"
          : "bg-background"
      )}
    >
      <div className="w-full px-4">
        <nav
          className="flex items-center justify-between py-4"
          aria-label="Navigation principală"
        >
          {/* Logo */}
          <Link
            to={PUBLIC_ROUTES.home}
            className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
            aria-label="APOT - Acasă"
          >
            <img
              src="/images/Logo-APOT-mic.webp"
              alt="APOT Logo"
              className="h-10 md:h-12 w-auto object-contain"
              loading="eager"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-base font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-primary"
                    : "text-foreground/80"
                )}
              >
                {item.name}
              </Link>
            ))}

            {/* Community Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Comunitate
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="z-[150]">
                <DropdownMenuItem asChild>
                  <Link to="/feed">Flux de Activitate</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/forum">Forum</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/journals">Jurnale de Călătorie</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/contests">Concursuri Foto</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/challenges">Provocări</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/leaderboards">Clasamente</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/suggest-objective">Sugerează Obiectiv</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Language Switcher - HIDDEN on mobile to save space */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* Theme Toggle - HIDDEN on mobile to save space */}
            <div className="hidden md:block">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>

            {/* Favorites Button */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate(PUBLIC_ROUTES.favorites)}
                aria-label="Favorite"
              >
                <Heart className="h-5 w-5" />
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

            {/* Forum Notifications */}
            {user && <NotificationBell />}

            {/* User Menu / Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Conectat
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  {/* Admin Panel Link - Only for Admins */}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer text-primary">
                          <Shield className="mr-2 h-4 w-4" />
                          <span className="font-medium">Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Deconectare
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth/login")}
                >
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate("/auth/signup")}>
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </nav>
      </div>

      {/* Portal mobile menu to body (escapes sticky header constraints) */}
      {typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Mobile Menu Backdrop */}
            {mobileMenuOpen && (
              <div
                className="fixed inset-0 bg-black/60  z-[110] md:hidden"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />
            )}
            {/* Mobile Menu Drawer */}
            <div
              className={cn(
                "fixed inset-x-0 top-[73px] z-[120] md:hidden",
                "bg-background/95 backdrop-blur-2xl border-b-2 border-primary/20 shadow-2xl",
                "max-h-[calc(100vh-73px)]",
                "overflow-y-auto overscroll-contain",
                "transition-all duration-300 ease-out",
                mobileMenuOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-4 pointer-events-none"
              )}
              {...(!mobileMenuOpen && { "aria-hidden": "true" })}
            >
              <div className="w-full px-4 py-4 space-y-1 pb-8">
                {/* Mobile-only: Theme Toggle & Language */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-border">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span className="text-sm font-medium">Temă & Limbă</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      aria-label="Toggle theme"
                    >
                      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                  </div>
                </div>

                {/* Navigation Links */}
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block px-4 py-3 text-base font-medium rounded-lg transition-all",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-primary/10 hover:text-primary active:scale-95"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Community Section */}
                <div className="pt-3 border-t-2 border-border mt-3">
                  <div className="px-4 py-2 text-xs font-bold text-foreground uppercase tracking-wider">
                    Comunitate
                  </div>
                  <div className="space-y-1">
                    {[
                      { to: "/feed", label: "Activity Feed" },
                      { to: "/forum", label: "Forum" },
                      { to: "/journals", label: "Travel Journals" },
                      { to: "/contests", label: "Photo Contests" },
                      { to: "/challenges", label: "Challenges" },
                      { to: "/leaderboards", label: "Leaderboards" },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 text-base text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-all active:scale-95"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <Link
                      to="/suggest-objective"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-base text-foreground hover:bg-primary/10 hover:text-primary rounded-lg border-t-2 border-border mt-2 pt-3 transition-all active:scale-95"
                    >
                      Sugerează Obiectiv
                    </Link>
                  </div>
                </div>

                {/* Admin Link - Only for Admins */}
                {user && isAdmin && (
                  <div className="pt-3 border-t-2 border-border mt-3">
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-base text-primary hover:bg-primary/10 rounded-lg font-semibold transition-all active:scale-95"
                    >
                      <Shield className="mr-2 h-5 w-5" />
                      Admin Panel
                    </Link>
                  </div>
                )}

                {/* Bottom safe area */}
                <div className="h-20" />
              </div>
            </div>
          </>,
          document.body
        )}
    </header>
  );
}