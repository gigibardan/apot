import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Eye, Trash2, Loader2, FileText, Copy } from "lucide-react";
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
import { getBlogArticles } from "@/lib/supabase/queries/blog";
import { deleteBlogArticle, toggleArticlePublish, duplicateBlogArticle } from "@/lib/supabase/mutations/blog";
import { toast } from "sonner";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/constants/routes";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";

export default function BlogAdmin() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string;
    title: string;
  }>({ open: false, id: "", title: "" });

  useEffect(() => {
    loadData();
  }, [search, categoryFilter, statusFilter, featuredOnly]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getBlogArticles({
        search,
        category: categoryFilter as any,
        published:
          statusFilter === "published"
            ? true
            : statusFilter === "draft"
            ? false
            : undefined,
        featured: featuredOnly || undefined,
        limit: 20,
      });
      setArticles(data.data);
    } catch (error) {
      console.error("Error loading articles:", error);
      toast.error("Eroare la încărcarea articolelor");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteBlogArticle(deleteDialog.id);
      toast.success("Articol șters cu succes");
      setDeleteDialog({ open: false, id: "", title: "" });
      loadData();
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Eroare la ștergerea articolului");
    }
  }

  async function handleTogglePublish(id: string, currentStatus: boolean) {
    try {
      await toggleArticlePublish(id, !currentStatus);
      toast.success(currentStatus ? "Articol nepublicat" : "Articol publicat");
      loadData();
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast.error("Eroare la actualizarea statusului");
    }
  }

  async function handleDuplicate(id: string) {
    try {
      const newArticle = await duplicateBlogArticle(id);
      toast.success("Articol duplicat cu succes");
      loadData();
    } catch (error) {
      console.error("Error duplicating article:", error);
      toast.error("Eroare la duplicarea articolului");
    }
  }

  // Get unique categories from articles
  const categories = Array.from(
    new Set(articles.map((a) => a.category).filter(Boolean))
  ) as string[];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Articole Blog" }]} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">
            Articole Blog
          </h2>
          <p className="text-muted-foreground mt-2">
            Gestionează articolele de blog
          </p>
        </div>
        <Button asChild size="lg">
          <Link to={`${ADMIN_ROUTES.blog}/nou`}>
            <Plus className="mr-2 h-5 w-5" />
            Articol Nou
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută articole..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Toate categoriile" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toate categoriile</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat || ""}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Toate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toate</SelectItem>
            <SelectItem value="published">Publicate</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
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
        {(search || categoryFilter || statusFilter || featuredOnly) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setCategoryFilter("");
              setStatusFilter("");
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
      ) : articles.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Imagine</TableHead>
                <TableHead>Titlu</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Vizualizări</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    {article.featured_image ? (
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{article.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {article.excerpt}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {article.category && (
                      <Badge variant="secondary">{article.category}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={article.published}
                          onCheckedChange={() =>
                            handleTogglePublish(article.id, article.published)
                          }
                        />
                        <span className="text-sm">
                          {article.published ? "Publicat" : "Draft"}
                        </span>
                      </div>
                      {article.featured && (
                        <Badge variant="outline" className="ml-2">
                          ⭐
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {article.views_count || 0}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {article.published_at
                        ? formatDistanceToNow(new Date(article.published_at), {
                            addSuffix: true,
                            locale: ro,
                          })
                        : formatDistanceToNow(new Date(article.created_at), {
                            addSuffix: true,
                            locale: ro,
                          })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="icon" title="Editează">
                        <Link to={`${ADMIN_ROUTES.blog}/${article.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" title="Vezi public">
                        <a
                          href={`${PUBLIC_ROUTES.blog}/${article.slug}`}
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
                        onClick={() => handleDuplicate(article.id)}
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
                            id: article.id,
                            title: article.title,
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
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {search || categoryFilter || statusFilter || featuredOnly
              ? "Niciun articol găsit"
              : "Niciun articol publicat încă"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {search || categoryFilter || statusFilter || featuredOnly
              ? "Încearcă să modifici filtrele de căutare"
              : "Începe prin a scrie primul articol"}
          </p>
          {!(search || categoryFilter || statusFilter || featuredOnly) && (
            <Button asChild>
              <Link to={`${ADMIN_ROUTES.blog}/nou`}>
                <Plus className="mr-2 h-4 w-4" />
                Scrie Primul Articol
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
              Vrei să ștergi articolul "{deleteDialog.title}"? Această acțiune nu
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
