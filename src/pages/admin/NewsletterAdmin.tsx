import { useState, useEffect } from "react";
import { Mail, Download, Trash2, Check, X, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { formatDate } from "@/lib/utils";
import {
  getNewsletterSubscribers,
  getNewsletterStats,
  type NewsletterFilters,
} from "@/lib/supabase/queries/newsletter";
import {
  bulkDeleteSubscribers,
  updateSubscriberStatus,
} from "@/lib/supabase/mutations/newsletter";

/**
 * Newsletter Admin Page
 * Manage newsletter subscribers, view statistics, and perform bulk actions
 */
export default function NewsletterAdmin() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<NewsletterFilters>({
    status: undefined,
    search: "",
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subscribersData, statsData] = await Promise.all([
        getNewsletterSubscribers(filters),
        getNewsletterStats(),
      ]);

      setSubscribers(subscribersData.subscribers);
      setTotalPages(subscribersData.pages);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading newsletter data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selected.size === subscribers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(subscribers.map((s) => s.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;

    if (!confirm(`Sigur vrei să ștergi ${selected.size} abonați?`)) return;

    try {
      await bulkDeleteSubscribers(Array.from(selected));
      setSelected(new Set());
      loadData();
    } catch (error) {
      console.error("Error deleting subscribers:", error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateSubscriberStatus(id, status as any);
      loadData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const exportCSV = () => {
    const csvData = subscribers.map((s) => ({
      Email: s.email,
      Nume: s.full_name || "-",
      Status: s.status,
      "Data Abonare": new Date(s.subscribed_at).toLocaleDateString("ro-RO"),
      Sursa: s.source,
    }));

    const headers = Object.keys(csvData[0]).join(",");
    const rows = csvData.map((row) => Object.values(row).join(","));
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Newsletter</h1>
          <p className="text-muted-foreground">
            Gestionează abonații newsletter-ului
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Abonați</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.recentGrowth} în ultimele 30 zile
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Activi</CardTitle>
              <Check className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.active / stats.total) * 100).toFixed(1)}% din total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">În Așteptare</CardTitle>
              <Filter className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Neconfirmați</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Dezabonați</CardTitle>
              <X className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unsubscribed}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.unsubscribed / stats.total) * 100).toFixed(1)}% din total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Caută după email sau nume..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value, page: 1 })
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  status: value === "all" ? undefined : (value as any),
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtru status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate</SelectItem>
                <SelectItem value="active">Activi</SelectItem>
                <SelectItem value="pending">În Așteptare</SelectItem>
                <SelectItem value="unsubscribed">Dezabonați</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selected.size} selectați
              </span>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Șterge Selectați
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscribers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selected.size === subscribers.length && subscribers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nume</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sursa</TableHead>
                <TableHead>Data Abonare</TableHead>
                <TableHead>Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(subscriber.id)}
                      onCheckedChange={() => handleSelect(subscriber.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>{subscriber.full_name || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        subscriber.status === "active"
                          ? "default"
                          : subscriber.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {subscriber.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{subscriber.source}</TableCell>
                  <TableCell>
                    {formatDate(new Date(subscriber.subscribed_at), {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={subscriber.status}
                      onValueChange={(value) =>
                        handleStatusChange(subscriber.id, value)
                      }
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activ</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="unsubscribed">Dezabonat</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ ...filters, page: page - 1 })}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Pagina {page} din {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ ...filters, page: page + 1 })}
            disabled={page >= totalPages}
          >
            Următorul
          </Button>
        </div>
      )}
    </div>
  );
}
