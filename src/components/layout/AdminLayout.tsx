import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MapPin, FileText, Image, Settings, Bus, ExternalLink, LogOut } from "lucide-react";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const sidebarLinks = [
  { name: "Dashboard", href: ADMIN_ROUTES.dashboard, icon: LayoutDashboard },
  { name: "Obiective", href: ADMIN_ROUTES.objectives, icon: MapPin },
  { name: "Blog", href: ADMIN_ROUTES.blog, icon: FileText },
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

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-sidebar">
        <div className="flex h-16 items-center border-b px-6">
          <Link
            to={ADMIN_ROUTES.dashboard}
            className="text-xl font-display font-bold text-sidebar-primary"
          >
            APOT Admin
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href || 
                            (link.href !== ADMIN_ROUTES.dashboard && location.pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="border-b bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold">Admin Panel</h1>
            
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
