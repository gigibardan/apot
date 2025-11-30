import { Outlet, Link } from "react-router-dom";
import { LayoutDashboard, MapPin, FileText, Image, Settings } from "lucide-react";
import { ADMIN_ROUTES } from "@/lib/constants/routes";

const sidebarLinks = [
  { name: "Dashboard", href: ADMIN_ROUTES.dashboard, icon: LayoutDashboard },
  { name: "Obiective", href: ADMIN_ROUTES.objectives, icon: MapPin },
  { name: "Blog", href: ADMIN_ROUTES.blog, icon: FileText },
  { name: "Media", href: ADMIN_ROUTES.media, icon: Image },
  { name: "Setări", href: ADMIN_ROUTES.settings, icon: Settings },
];

/**
 * Admin Layout
 * Layout for admin panel with sidebar navigation
 * TODO: Add authentication check
 */
export default function AdminLayout() {
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
            return (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
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
            <div className="text-sm text-muted-foreground">
              TODO: User menu
            </div>
          </div>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
