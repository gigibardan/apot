import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, FileText, Eye, Bus, Plus, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats, getRecentActivity } from "@/lib/supabase/queries/admin";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { ADMIN_ROUTES } from "@/lib/constants/routes";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, activityData] = await Promise.all([
          getDashboardStats(),
          getRecentActivity(5),
        ]);
        setStats(statsData);
        setActivity(activityData);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold tracking-tight">
          Dashboard
        </h2>
        <p className="text-muted-foreground mt-2">
          Prezentare generală a platformei APOT
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link to={ADMIN_ROUTES.objectives}>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="h-5 w-5 text-primary" />
              <Badge variant="secondary">{stats.objectives.published} publicate</Badge>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Obiective
            </p>
            <p className="text-3xl font-bold mt-2">{stats.objectives.total}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.objectives.drafts} drafturi
            </p>
          </Card>
        </Link>

        <Link to={ADMIN_ROUTES.blog}>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 text-primary" />
              <Badge variant="secondary">{stats.articles.published} publicate</Badge>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Articole Blog
            </p>
            <p className="text-3xl font-bold mt-2">{stats.articles.total}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.articles.drafts} drafturi
            </p>
          </Card>
        </Link>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Vizualizări Totale
          </p>
          <p className="text-3xl font-bold mt-2">{stats.views.total.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Obiective + Articole
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Bus className="h-5 w-5 text-primary" />
            <Badge variant="secondary">{stats.circuits.featured} featured</Badge>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Circuite Jinfotours
          </p>
          <p className="text-3xl font-bold mt-2">{stats.circuits.total}</p>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold mb-4">
            Activitate Recentă
          </h3>
          {activity.length > 0 ? (
            <div className="space-y-4">
              {activity.map((item) => (
                <Link
                  key={item.id}
                  to={
                    item.type === "objective"
                      ? `${ADMIN_ROUTES.objectives}/${item.id}`
                      : `${ADMIN_ROUTES.blog}/${item.id}`
                  }
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {item.featured_image && (
                    <img
                      src={item.featured_image}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.type === "objective" ? "Obiectiv" : "Articol"}
                      </Badge>
                      {item.published ? (
                        <Badge className="text-xs">Publicat</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Draft
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium truncate mt-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                        locale: ro,
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Niciun conținut adăugat încă
            </p>
          )}
        </Card>

        {/* Quick Create */}
        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold mb-4">
            Creează Conținut Nou
          </h3>
          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link to={`${ADMIN_ROUTES.objectives}/nou`}>
                <Plus className="mr-2 h-5 w-5" />
                Adaugă Obiectiv Nou
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link to={`${ADMIN_ROUTES.blog}/nou`}>
                <Plus className="mr-2 h-5 w-5" />
                Scrie Articol Nou
              </Link>
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">💡 Sugestii</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Adaugă imagini de calitate pentru fiecare obiectiv</li>
              <li>• Completează toate câmpurile SEO pentru vizibilitate</li>
              <li>• Publică conținut în mod regulat pentru engagement</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
