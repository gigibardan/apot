import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { getRealTimeStats } from "@/lib/supabase/queries/analytics";

export function RealTimeStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getRealTimeStats();
        setStats(data);
      } catch (error) {
        console.error("Error loading real-time stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 animate-pulse text-green-500" />
            Statistici Real-Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Se încarcă...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 animate-pulse text-green-500" />
            Statistici Real-Time
          </CardTitle>
          <Badge variant="secondary">Ultimele 24h</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-primary/5">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Vizualizări</p>
            </div>
            <p className="text-2xl font-bold">{stats.last24h.views.toLocaleString()}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-primary/5">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Vizitatori Unici</p>
            </div>
            <p className="text-2xl font-bold">{stats.last24h.visitors.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-3">Pagini Recent Vizitate:</p>
          <div className="space-y-2">
            {stats.recentPages.slice(0, 5).map((page: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs"
              >
                <span className="truncate flex-1" title={page.page_title}>
                  {page.page_title || page.page_url}
                </span>
                <Badge variant="outline" className="text-xs ml-2">
                  {new Date(page.viewed_at).toLocaleTimeString("ro-RO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
