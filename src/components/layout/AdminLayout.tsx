import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LayoutDashboard, MapPin, FileText, Image, Settings, Bus, ExternalLink, LogOut, Menu, X } from "lucide-react";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getDashboardStats } from "@/lib/supabase/queries/admin";

const sidebarLinks = [
  { name: "Dashboard", href: ADMIN_ROUTES.dashboard, icon: LayoutDashboard },
  { name: "Obiective", href: ADMIN_ROUTES.objectives, icon: MapPin, showDrafts: true },
  { name: "Blog", href: ADMIN_ROUTES.blog, icon: FileText, showDrafts: true },
  { name: "Circuite", href: ADMIN_ROUTES.circuits, icon: Bus },
  { name: "Media", href: ADMIN_ROUTES.media, icon: Image },
  { name: "Setări", href: ADMIN_ROUTES.settings, icon: Settings },
];

/**
 * Admin Layout
 * Layout for admin panel with sidebar navigation
 * TODO: Add authentication check
 */
export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draftCounts, setDraftCounts] = useState<{ objectives: number; articles: number }>({
    objectives: 0,
    articles: 0,
  });

  useEffect(() => {
    loadDraftCounts();
  }, []);

  async function loadDraftCounts() {
    try {
      const stats = await getDashboardStats();
      setDraftCounts({
        objectives: stats.objectives.drafts || 0,
        articles: stats.articles.drafts || 0,
      });
    } catch (error) {
      console.error("Error loading draft counts:", error);
    }
  }

  const getDraftCount = (linkName: string) => {
    if (linkName === "Obiective") return draftCounts.objectives;
    if (linkName === "Blog") return draftCounts.articles;
    return 0;
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 border-r bg-sidebar transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link
            to={ADMIN_ROUTES.dashboard}
            className="text-xl font-display font-bold text-sidebar-primary"
            onClick={() => setSidebarOpen(false)}
          >
            APOT Admin
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="space-y-1 p-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              location.pathname === link.href ||
              (link.href !== ADMIN_ROUTES.dashboard &&
                location.pathname.startsWith(link.href));
            const draftCount = link.showDrafts ? getDraftCount(link.name) : 0;

            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{link.name}</span>
                </div>
                {draftCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {draftCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="border-b bg-background px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl lg:text-2xl font-display font-bold">Admin Panel</h1>
            </div>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href={PUBLIC_ROUTES.home} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Vezi Site-ul
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ADMIN_ROUTES.settings}>
                    <Settings className="mr-2 h-4 w-4" />
                    Setări
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
