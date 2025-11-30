import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Eye, Trash2, Loader2, MapPin, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getObjectives } from "@/lib/supabase/queries/objectives";
import { deleteObjective, toggleObjectivePublish, duplicateObjective } from "@/lib/supabase/mutations/objectives";
import { getContinents } from "@/lib/supabase/queries/taxonomies";
import { toast } from "sonner";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/constants/routes";

export default function ObjectivesAdmin() {
  const [objectives, setObjectives] = useState<any[]>([]);
  const [continents, setContinents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [continentFilter, setContinentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string;
    title: string;
  }>({ open: false, id: "", title: "" });

  useEffect(() => {
    loadData();
  }, [search, continentFilter, statusFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const [objectivesData, continentsData] = await Promise.all([
        getObjectives({
          search,
          continent: continentFilter || undefined,
          published:
            statusFilter === "published"
              ? true
              : statusFilter === "draft"
              ? false
              : undefined,
          limit: 20,
        }),
        getContinents(),
      ]);
      setObjectives(objectivesData.data);
      setContinents(continentsData);
    } catch (error) {
      console.error("Error loading objectives:", error);
      toast.error("Eroare la încărcarea obiectivelor");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteObjective(deleteDialog.id);
      toast.success("Obiectiv șters cu succes");
      setDeleteDialog({ open: false, id: "", title: "" });
      loadData();
    } catch (error) {
      console.error("Error deleting objective:", error);
      toast.error("Eroare la ștergerea obiectivului");
    }
  }

  async function handleTogglePublish(id: string, currentStatus: boolean) {
    try {
      await toggleObjectivePublish(id, !currentStatus);
      toast.success(
        currentStatus ? "Obiectiv nepublicat" : "Obiectiv publicat"
      );
      loadData();
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast.error("Eroare la actualizarea statusului");
    }
  }

  async function handleDuplicate(id: string) {
    try {
      const newObjective = await duplicateObjective(id);
      toast.success("Obiectiv duplicat cu succes");
      loadData();
    } catch (error) {
      console.error("Error duplicating objective:", error);
      toast.error("Eroare la duplicarea obiectivului");
    }
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(objectives.map(obj => obj.id));
    } else {
      setSelectedIds([]);
    }
  }

  function handleSelectOne(id: string, checked: boolean) {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  }

  async function handleBulkAction() {
    if (!bulkAction || selectedIds.length === 0) return;

    setBulkLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      if (bulkAction === "publish" || bulkAction === "unpublish") {
        const published = bulkAction === "publish";
        for (const id of selectedIds) {
          try {
            await toggleObjectivePublish(id, published);
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }
        toast.success(`${successCount} obiective ${published ? "publicate" : "nepublicate"}`);
      } else if (bulkAction === "delete") {
        for (const id of selectedIds) {
          try {
            await deleteObjective(id);
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }
        toast.success(`${successCount} obiective șterse`);
      } else if (bulkAction === "export") {
        exportToCSV();
        toast.success("Export CSV inițiat");
      }

      if (errorCount > 0) {
        toast.error(`${errorCount} operațiuni eșuate`);
      }

      setSelectedIds([]);
      setBulkAction("");
      loadData();
    } catch (error) {
      console.error("Bulk action error:", error);
      toast.error("Eroare la executarea acțiunii în masă");
    } finally {
      setBulkLoading(false);
    }
  }

  function exportToCSV() {
    const selectedObjs = objectives.filter(obj => selectedIds.includes(obj.id));
    const csv = [
      ["ID", "Titlu", "Slug", "Țară", "Status", "Featured", "Vizualizări"].join(","),
      ...selectedObjs.map(obj => [
        obj.id,
        `"${obj.title}"`,
        obj.slug,
        obj.country?.name || "",
        obj.published ? "Publicat" : "Draft",
        obj.featured ? "Da" : "Nu",
        obj.views_count || 0
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `obiective_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Obiective" }]} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">
            Obiective Turistice
          </h2>
          <p className="text-muted-foreground mt-2">
            Gestionează obiectivele turistice din platformă
          </p>
        </div>
        <Button asChild size="lg">
          <Link to={`${ADMIN_ROUTES.objectives}/nou`}>
            <Plus className="mr-2 h-5 w-5" />
            Obiectiv Nou
          </Link>
        </Button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-0 z-10 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium">{selectedIds.length} selectate</span>
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-48 bg-primary-foreground text-foreground">
                <SelectValue placeholder="Alege acțiune" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publish">Publică</SelectItem>
                <SelectItem value="unpublish">Nepublică</SelectItem>
                <SelectItem value="delete">Șterge</SelectItem>
                <SelectItem value="export">Exportă CSV</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleBulkAction}
              disabled={!bulkAction || bulkLoading}
              variant="secondary"
            >
              {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Aplică
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds([])}
            className="text-primary-foreground hover:text-primary-foreground/80"
          >
            Anulează
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută obiective..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={continentFilter || "all"} onValueChange={(val) => setContinentFilter(val === "all" ? "" : val)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Toate continentele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate continentele</SelectItem>
            {continents.map((continent) => (
              <SelectItem key={continent.id} value={continent.id}>
                {continent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter || "all"} onValueChange={(val) => setStatusFilter(val === "all" ? "" : val)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Toate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate</SelectItem>
            <SelectItem value="published">Publicate</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        {(search || continentFilter || statusFilter) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setContinentFilter("");
              setStatusFilter("");
            }}
          >
            Resetează
          </Button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : objectives.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === objectives.length && objectives.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-20">Imagine</TableHead>
                <TableHead>Titlu</TableHead>
                <TableHead>Țară</TableHead>
                <TableHead>Tipuri</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Vizualizări</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {objectives.map((objective) => (
                <TableRow key={objective.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(objective.id)}
                      onCheckedChange={(checked) => handleSelectOne(objective.id, checked === true)}
                    />
                  </TableCell>
                  <TableCell>
                    {objective.featured_image ? (
                      <img
                        src={objective.featured_image}
                        alt={objective.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{objective.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {objective.location_text}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {objective.country?.flag_emoji} {objective.country?.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {objective.types?.slice(0, 2).map((type: any) => (
                        <Badge key={type.id} variant="secondary" className="text-xs">
                          {type.name}
                        </Badge>
                      ))}
                      {objective.types?.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{objective.types.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={objective.published}
                          onCheckedChange={() =>
                            handleTogglePublish(objective.id, objective.published)
                          }
                        />
                        <span className="text-sm">
                          {objective.published ? "Publicat" : "Draft"}
                        </span>
                      </div>
                      {objective.featured && (
                        <Badge variant="outline" className="ml-2">⭐</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {objective.views_count || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="icon" title="Editează">
                        <Link to={`${ADMIN_ROUTES.objectives}/${objective.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" title="Vezi public">
                        <a
                          href={`${PUBLIC_ROUTES.objectives}/${objective.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Duplică"
                        onClick={() => handleDuplicate(objective.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Șterge"
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            id: objective.id,
                            title: objective.title,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {search || continentFilter || statusFilter
              ? "Niciun obiectiv găsit"
              : "Niciun obiectiv adăugat încă"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {search || continentFilter || statusFilter
              ? "Încearcă să modifici filtrele de căutare"
              : "Începe prin a adăuga primul obiectiv turistic"}
          </p>
          {!(search || continentFilter || statusFilter) && (
            <Button asChild>
              <Link to={`${ADMIN_ROUTES.objectives}/nou`}>
                <Plus className="mr-2 h-4 w-4" />
                Adaugă Primul Obiectiv
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ ...deleteDialog, open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
            <AlertDialogDescription>
              Vrei să ștergi obiectivul "{deleteDialog.title}"? Această acțiune
              nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
