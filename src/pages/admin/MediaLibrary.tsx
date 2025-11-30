import { useEffect, useState } from "react";
import { Upload, Search, Loader2, X, Image as ImageIcon, Copy, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/admin/ImageUpload";
import { getMediaLibrary, deleteMediaFile, updateMediaFile } from "@/lib/supabase/queries/media";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function MediaLibrary() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string;
    filename: string;
  }>({ open: false, id: "", filename: "" });

  useEffect(() => {
    loadMedia();
  }, [search, folder, sortBy]);

  async function loadMedia() {
    setLoading(true);
    try {
      const data = await getMediaLibrary({ search, folder, sortBy });
      setMedia(data || []);
    } catch (error) {
      console.error("Error loading media:", error);
      toast.error("Eroare la încărcarea media");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteMediaFile(deleteDialog.id);
      toast.success("Fișier șters cu succes");
      setDeleteDialog({ open: false, id: "", filename: "" });
      loadMedia();
      if (detailsOpen) setDetailsOpen(false);
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Eroare la ștergerea fișierului");
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copiat!");
    } catch (error) {
      toast.error("Eroare la copiere");
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function openDetails(item: any) {
    setSelectedMedia(item);
    setDetailsOpen(true);
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Media" }]} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">
            Bibliotecă Media
          </h2>
          <p className="text-muted-foreground mt-2">
            Toate imaginile încărcate
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)} size="lg">
          <Upload className="mr-2 h-5 w-5" />
          Upload Imagini
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută fișiere..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={folder} onValueChange={setFolder}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Toate folderele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate folderele</SelectItem>
            <SelectItem value="objectives">Obiective</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
            <SelectItem value="circuits">Circuite</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sortează" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Cel mai recent</SelectItem>
            <SelectItem value="oldest">Cel mai vechi</SelectItem>
            <SelectItem value="name">Nume (A-Z)</SelectItem>
          </SelectContent>
        </Select>
        {(search || folder !== "all" || sortBy !== "newest") && (
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setFolder("all");
              setSortBy("newest");
            }}
          >
            Resetează
          </Button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : media.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer"
              onClick={() => openDetails(item)}
            >
              <img
                src={item.file_url}
                alt={item.alt_text || item.filename}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <p className="text-white text-xs text-center truncate w-full">
                  {item.filename}
                </p>
                <p className="text-white/70 text-xs">
                  {formatFileSize(item.file_size)}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyUrl(item.file_url);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDialog({
                        open: true,
                        id: item.id,
                        filename: item.filename,
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {search || folder !== "all" ? "Niciun fișier găsit" : "Nicio imagine încărcată încă"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {search || folder !== "all"
              ? "Încearcă să modifici filtrele"
              : "Începe prin a încărca prima imagine"}
          </p>
          {!(search || folder !== "all") && (
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Prima Imagine
            </Button>
          )}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Imagini</DialogTitle>
            <DialogDescription>
              Încarcă una sau mai multe imagini în bibliotecă
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Folder</Label>
              <Select defaultValue="objectives">
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="objectives">Obiective</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="circuits">Circuite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ImageUpload
              bucket="media"
              value=""
              onChange={() => {
                loadMedia();
                toast.success("Imagine încărcată!");
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      {selectedMedia && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalii Fișier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedMedia.file_url}
                  alt={selectedMedia.alt_text || selectedMedia.filename}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nume fișier</p>
                  <p className="font-medium">{selectedMedia.filename}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dimensiune</p>
                  <p className="font-medium">{formatFileSize(selectedMedia.file_size)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dimensiuni</p>
                  <p className="font-medium">
                    {selectedMedia.width} × {selectedMedia.height} px
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Încărcat la</p>
                  <p className="font-medium">{formatDate(selectedMedia.created_at)}</p>
                </div>
              </div>
              <div>
                <Label>URL Public</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={selectedMedia.file_url} readOnly />
                  <Button
                    variant="secondary"
                    onClick={() => copyUrl(selectedMedia.file_url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedMedia.file_url, "_blank")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDetailsOpen(false);
                    setDeleteDialog({
                      open: true,
                      id: selectedMedia.id,
                      filename: selectedMedia.filename,
                    });
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Șterge
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
              Vrei să ștergi fișierul "{deleteDialog.filename}"? Această acțiune nu poate fi anulată.
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
