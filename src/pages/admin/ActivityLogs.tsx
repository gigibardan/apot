import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Download, Filter, User, FileText, Settings, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { ADMIN_ROUTES } from "@/lib/constants/routes";

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: any;
  changes_data: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
  ip_address: string;
  user_agent: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const logsPerPage = 50;

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter, severityFilter]);

  async function loadLogs() {
    try {
      setLoading(true);
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .range((page - 1) * logsPerPage, page * logsPerPage - 1);

      if (actionFilter !== "all") {
        query = query.eq('action', actionFilter);
      }

      if (severityFilter !== "all") {
        query = query.eq('severity', severityFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error loading logs:", error);
      toast.error("Eroare la încărcarea log-urilor");
    } finally {
      setLoading(false);
    }
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'error': return 'bg-orange-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  }

  function getActionIcon(action: string) {
    if (action.includes('user')) return User;
    if (action.includes('content') || action.includes('created') || action.includes('updated')) return FileText;
    if (action.includes('settings')) return Settings;
    return AlertCircle;
  }

  async function exportLogs() {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      const csv = [
        ['Date', 'User ID', 'Action', 'Entity Type', 'Entity ID', 'Severity', 'IP Address'].join(','),
        ...(data || []).map(log => [
          log.created_at,
          log.user_id,
          log.action,
          log.entity_type || '',
          log.entity_id || '',
          log.severity,
          log.ip_address || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();

      toast.success("Log-uri exportate cu succes!");
    } catch (error) {
      console.error("Error exporting logs:", error);
      toast.error("Eroare la exportarea log-urilor");
    }
  }

  const filteredLogs = logs.filter(log => 
    search === "" || 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.entity_type?.toLowerCase().includes(search.toLowerCase()) ||
    log.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Activity Logs" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold">Activity Logs</h2>
          <p className="text-muted-foreground">Audit trail - toate acțiunile admin</p>
        </div>
        <Button onClick={exportLogs} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Caută în logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tip acțiune" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate acțiunile</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="login">Login</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severitate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Niciun log găsit
              </CardContent>
            </Card>
          ) : (
            filteredLogs.map((log) => {
              const ActionIcon = getActionIcon(log.action);
              return (
                <Card key={log.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Severity indicator */}
                      <div className={`w-1 h-12 rounded ${getSeverityColor(log.severity)}`} />

                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        <div className="p-2 bg-muted rounded-lg">
                          <ActionIcon className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <p className="font-medium">
                              {log.profiles?.full_name || 'Unknown User'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {log.action}
                              {log.entity_type && ` • ${log.entity_type}`}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {log.severity}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{format(new Date(log.created_at), 'dd MMM yyyy, HH:mm:ss')}</span>
                          {log.ip_address && (
                            <span>IP: {log.ip_address}</span>
                          )}
                        </div>

                        {/* Changes data */}
                        {log.changes_data && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                            <pre className="overflow-x-auto">
                              {JSON.stringify(log.changes_data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Anterior
        </Button>
        <Button variant="outline" disabled>
          Pagina {page}
        </Button>
        <Button
          variant="outline"
          onClick={() => setPage(p => p + 1)}
          disabled={logs.length < logsPerPage}
        >
          Următoarea
        </Button>
      </div>
    </div>
  );
}
