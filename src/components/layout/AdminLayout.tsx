import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  MapPin,
  FileText,
  Bus,
  Image,
  Settings,
  Users,
  Menu,
  X,
  LogOut,
  Eye,
  MessageCircle,
  Activity,
  ShieldOff,
  CalendarClock,
  History,
  Search,
} from "lucide-react";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getDashboardStats } from "@/lib/supabase/queries/admin";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { name: "Dashboard", href: ADMIN_ROUTES.dashboard, icon: LayoutDashboard },
  { name: "Analytics", href: ADMIN_ROUTES.analytics, icon: Eye },
  { name: "Obiective", href: ADMIN_ROUTES.objectives, icon: MapPin, showDrafts: true },
  { name: "Blog", href: ADMIN_ROUTES.blog, icon: FileText, showDrafts: true },
  { name: "Circuite", href: ADMIN_ROUTES.circuits, icon: Bus },
  { name: "Ghizi", href: ADMIN_ROUTES.guides, icon: Users },
  { name: "Forum", href: ADMIN_ROUTES.forum, icon: MessageCircle },
  { name: "Media", href: ADMIN_ROUTES.media, icon: Image },
  { name: "Newsletter", href: ADMIN_ROUTES.newsletter, icon: FileText },
  { name: "Sugestii", href: "/admin/suggestions", icon: FileText },
  { name: "Contests", href: "/admin/contests", icon: FileText },
  { name: "Challenges", href: "/admin/challenges", icon: FileText },
  { name: "Activity Logs", href: "/admin/activity-logs", icon: Activity },
  { name: "Scheduled", href: "/admin/scheduled", icon: CalendarClock },
  { name: "Revisions", href: "/admin/content-revisions", icon: History },
  { name: "SEO Audit", href: "/admin/seo-audit", icon: Search },
  { name: "Setări", href: ADMIN_ROUTES.settings, icon: Settings },
];

/**
 * Admin Layout
 * Layout for admin panel with sidebar navigation
 * TODO: Add authentication check
 */
export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draftCounts, setDraftCounts] = useState<{ objectives: number; articles: number }>({
    objectives: 0,
    articles: 0,
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // All sidebar links including conditional Users link for admins
  const allSidebarLinks = [
    ...sidebarLinks,
    ...(isAdmin ? [{ name: "Utilizatori", href: "/admin/utilizatori", icon: Users, showDrafts: false }] : []),
    { name: "Import", href: "/admin/import", icon: FileText, showDrafts: false },
    { name: "Template-uri", href: "/admin/templates", icon: FileText, showDrafts: false },
  ];

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast({
        title: "Deconectat cu succes",
        description: "Ai fost deconectat din contul tău",
      });
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu s-a putut deconecta. Încearcă din nou.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getUserRoleLabel = () => {
    switch (userRole) {
      case "admin":
        return "Administrator";
      case "editor":
        return "Editor";
      case "contributor":
        return "Contributor";
      default:
        return "Utilizator";
    }
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
          {allSidebarLinks.map((link) => {
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
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {getUserRoleLabel()}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href={PUBLIC_ROUTES.home} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
                    Vezi Site-ul
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ADMIN_ROUTES.settings} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Setări
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? "Se deconectează..." : "Deconectare"}
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
