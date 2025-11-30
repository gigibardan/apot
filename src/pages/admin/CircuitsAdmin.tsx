import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Loader2, Bus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { Input } from "@/components/ui/input";
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
import { getCircuits } from "@/lib/supabase/queries/jinfotours";
import { deleteCircuit } from "@/lib/supabase/mutations/circuits";
import { toast } from "sonner";
import { ADMIN_ROUTES } from "@/lib/constants/routes";

export default function CircuitsAdmin() {
  const [circuits, setCircuits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
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
  }, [search, featuredOnly]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getCircuits(featuredOnly || undefined, search || undefined);
      setCircuits(data || []);
    } catch (error) {
      console.error("Error loading circuits:", error);
      toast.error("Eroare la încărcarea circuitelor");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteCircuit(deleteDialog.id);
      toast.success("Circuit șters cu succes");
      setDeleteDialog({ open: false, id: "", title: "" });
      loadData();
    } catch (error) {
      console.error("Error deleting circuit:", error);
      toast.error("Eroare la ștergerea circuitului");
    }
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(circuits.map(cir => cir.id));
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
      if (bulkAction === "delete") {
        for (const id of selectedIds) {
          try {
            await deleteCircuit(id);
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }
        toast.success(`${successCount} circuite șterse`);
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
    const selectedCircs = circuits.filter(cir => selectedIds.includes(cir.id));
    const csv = [
      ["ID", "Titlu", "Slug", "Durată (zile)", "Preț", "Featured"].join(","),
      ...selectedCircs.map(cir => [
        cir.id,
        `"${cir.title}"`,
        cir.slug,
        cir.duration_days || 0,
        cir.price_from || 0,
        cir.featured ? "Da" : "Nu"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `circuite_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Circuite" }]} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">
            Circuite Turistice
          </h2>
          <p className="text-muted-foreground mt-2">
            Gestionează circuitele Jinfotours
          </p>
        </div>
        <Button asChild size="lg">
          <Link to={`${ADMIN_ROUTES.circuits}/nou`}>
            <Plus className="mr-2 h-5 w-5" />
            Circuit Nou
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
            placeholder="Caută circuite..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="featured"
            checked={featuredOnly}
            onCheckedChange={(checked) => setFeaturedOnly(checked === true)}
          />
          <label
            htmlFor="featured"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Doar featured
          </label>
        </div>
        {(search || featuredOnly) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setFeaturedOnly(false);
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
      ) : circuits.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === circuits.length && circuits.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-20">Imagine</TableHead>
                <TableHead>Titlu</TableHead>
                <TableHead>Destinație</TableHead>
                <TableHead>Durată</TableHead>
                <TableHead>Preț</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {circuits.map((circuit) => (
                <TableRow key={circuit.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(circuit.id)}
                      onCheckedChange={(checked) => handleSelectOne(circuit.id, checked === true)}
                    />
                  </TableCell>
                  <TableCell>
                    {circuit.thumbnail_url ? (
                      <img
                        src={circuit.thumbnail_url}
                        alt={circuit.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded" />
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{circuit.title}</p>
                    {circuit.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {circuit.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {circuit.countries && circuit.countries.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {circuit.countries.map((country: string, i: number) => (
                          <Badge key={i} variant="outline">
                            {country}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {circuit.duration_days ? `${circuit.duration_days} zile` : "-"}
                  </TableCell>
                  <TableCell>
                    {circuit.price_from ? `€${circuit.price_from}` : "-"}
                  </TableCell>
                  <TableCell>
                    {circuit.featured && (
                      <Badge variant="outline">⭐ Featured</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link to={`${ADMIN_ROUTES.circuits}/${circuit.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            id: circuit.id,
                            title: circuit.title,
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
          <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {search || featuredOnly
              ? "Niciun circuit găsit"
              : "Niciun circuit adăugat încă"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {search || featuredOnly
              ? "Încearcă să modifici filtrele de căutare"
              : "Începe prin a adăuga primul circuit"}
          </p>
          {!(search || featuredOnly) && (
            <Button asChild>
              <Link to={`${ADMIN_ROUTES.circuits}/nou`}>
                <Plus className="mr-2 h-4 w-4" />
                Adaugă Primul Circuit
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
            <AlertDialogDescription>
              Vrei să ștergi circuitul "{deleteDialog.title}"? Această acțiune nu
              poate fi anulată.
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
