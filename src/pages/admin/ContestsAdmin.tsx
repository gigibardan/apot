import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageUpload from "@/components/admin/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Plus, Calendar, Clock, Pencil, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import DOMPurify from "dompurify";

interface ContestFormData {
  title: string;
  slug: string;
  description: string;
  theme: string;
  prizes_description: string;
  cover_image: string;
  start_date: string;
  end_date: string;
  voting_end_date: string;
  rules: string;
}

const emptyFormData: ContestFormData = {
  title: "",
  slug: "",
  description: "",
  theme: "",
  prizes_description: "",
  cover_image: "",
  start_date: "",
  end_date: "",
  voting_end_date: "",
  rules: "",
};

export default function ContestsAdmin() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<any>(null);
  const [contestToDelete, setContestToDelete] = useState<any>(null);
  const [formData, setFormData] = useState<ContestFormData>(emptyFormData);

  const { data: contests, isLoading } = useQuery({
    queryKey: ["adminContests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photo_contests")
        .select("*")
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ContestFormData) => {
      const { error } = await supabase.from("photo_contests").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminContests"] });
      toast.success("Contest creat cu succes!");
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || "Eroare la crearea contestului");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ContestFormData }) => {
      const { error } = await supabase
        .from("photo_contests")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminContests"] });
      toast.success("Contest actualizat cu succes!");
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || "Eroare la actualizarea contestului");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("photo_contests")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminContests"] });
      toast.success("Contest șters cu succes!");
      setDeleteDialogOpen(false);
      setContestToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Eroare la ștergerea contestului");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("photo_contests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminContests"] });
      toast.success("Status actualizat!");
    },
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingContest(null);
    setFormData(emptyFormData);
  };

  const openCreateDialog = () => {
    setEditingContest(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const openEditDialog = (contest: any) => {
    setEditingContest(contest);
    setFormData({
      title: contest.title || "",
      slug: contest.slug || "",
      description: contest.description || "",
      theme: contest.theme || "",
      prizes_description: contest.prizes_description || "",
      cover_image: contest.cover_image || "",
      start_date: contest.start_date ? contest.start_date.split("T")[0] : "",
      end_date: contest.end_date ? contest.end_date.split("T")[0] : "",
      voting_end_date: contest.voting_end_date ? contest.voting_end_date.split("T")[0] : "",
      rules: contest.rules || "",
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (contest: any) => {
    setContestToDelete(contest);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContest) {
      updateMutation.mutate({ id: editingContest.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (contestToDelete) {
      deleteMutation.mutate(contestToDelete.id);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Photo Contests</h1>
            <p className="text-muted-foreground">Gestionează concursurile foto</p>
          </div>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Contest Nou
        </Button>
      </div>

      {!contests || contests.length === 0 ? (
        <Card className="p-12 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Niciun contest</h3>
          <p className="text-muted-foreground mb-4">Creează primul contest foto!</p>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Adaugă Contest
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {contests.map((contest: any) => (
            <Card key={contest.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl mb-2">{contest.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{contest.theme}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant={
                        contest.status === "active"
                          ? "default"
                          : contest.status === "voting"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {contest.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(contest)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(contest)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {contest.description && (
                  <div 
                    className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(contest.description, {
                        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'blockquote'],
                        ALLOWED_ATTR: ['href', 'target', 'rel'],
                        ALLOW_DATA_ATTR: false
                      })
                    }}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>Start: {format(new Date(contest.start_date), "dd MMM yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>End: {format(new Date(contest.end_date), "dd MMM yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>Voting: {format(new Date(contest.voting_end_date), "dd MMM yyyy")}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Link to={`/admin/contests/${contest.id}/submissions`}>
                    <Button variant="default" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Review Submissions
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateStatusMutation.mutate({ id: contest.id, status: "active" })
                    }
                    disabled={contest.status === "active"}
                  >
                    Activează
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateStatusMutation.mutate({ id: contest.id, status: "voting" })
                    }
                    disabled={contest.status === "voting"}
                  >
                    Votare
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateStatusMutation.mutate({ id: contest.id, status: "ended" })
                    }
                    disabled={contest.status === "ended"}
                  >
                    Încheie
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContest ? "Editează Contest" : "Contest Nou"}
            </DialogTitle>
            <DialogDescription>
              {editingContest
                ? "Modifică detaliile concursului foto."
                : "Completează formularul pentru a crea un nou concurs foto."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titlu *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData({
                      ...formData,
                      title,
                      slug: !editingContest && !formData.slug ? generateSlug(title) : formData.slug,
                    });
                  }}
                  placeholder="Ex: Concursul Foto de Iarnă 2024"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="concurs-foto-iarna-2024"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Temă</Label>
              <Input
                id="theme"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                placeholder="Ex: Cele mai frumoase peisaje de iarnă"
              />
            </div>

            <div className="space-y-2">
              <Label>Descriere</Label>
              <RichTextEditor
                content={formData.description}
                onChange={(content) => setFormData({ ...formData, description: content })}
                placeholder="Descrie concursul..."
              />
            </div>

            <div className="space-y-2">
              <Label>Premii</Label>
              <RichTextEditor
                content={formData.prizes_description}
                onChange={(content) => setFormData({ ...formData, prizes_description: content })}
                placeholder="Descrie premiile oferite..."
              />
            </div>

            <div className="space-y-2">
              <Label>Regulament</Label>
              <RichTextEditor
                content={formData.rules}
                onChange={(content) => setFormData({ ...formData, rules: content })}
                placeholder="Regulamentul concursului..."
              />
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <ImageUpload
                value={formData.cover_image}
                onChange={(url) => setFormData({ ...formData, cover_image: url })}
                bucket="blog-images"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data Start *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Data Încheiere Înscrieri *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="voting_end_date">Data Încheiere Votare *</Label>
                <Input
                  id="voting_end_date"
                  type="date"
                  value={formData.voting_end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, voting_end_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Anulează
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Se salvează..."
                  : editingContest
                  ? "Salvează Modificările"
                  : "Creează Contest"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ștergi concursul?</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi concursul „{contestToDelete?.title}"? 
              Această acțiune este ireversibilă și va șterge toate submisiile asociate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setContestToDelete(null)}>
              Anulează
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Se șterge..." : "Șterge"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
