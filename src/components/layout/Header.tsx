import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, Heart, LogOut, User, Settings as SettingsIcon, Shield } from "lucide-react";
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

            {/* Community Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Comunitate
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/feed">Activity Feed</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/forum">Forum</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/journals">Travel Journals</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/contests">Photo Contests</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/challenges">Challenges</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/leaderboards">Leaderboards</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/suggest-objective">Sugerează Obiectiv</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

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
      </Container>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <Container>
            <div className="py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-2 text-sm rounded-md",
                    pathname === item.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground/80 hover:bg-background/80"
                  )}
                >
                  {item.name}
                </Link>
              ))}

              {/* Community Section in Mobile */}
              <div className="pt-2 border-t border-foreground/10 mt-2">
                <div className="px-4 py-2 text-xs font-semibold text-foreground/60 uppercase">
                  Comunitate
                </div>
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

              {/* Admin Link in Mobile - Only for Admins */}
              {user && isAdmin && (
                <div className="pt-2 border-t border-foreground/10 mt-2">
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-md font-medium"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </div>
              )}
              
              {/* Bottom padding for safe area */}
              <div className="h-8" />
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}