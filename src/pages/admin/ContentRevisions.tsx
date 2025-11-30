import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, History, RotateCcw, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Revision {
  id: string;
  revision_number: number;
  content_snapshot: any;
  change_summary: string | null;
  changed_by: string;
  changed_at: string;
  profiles?: {
    full_name: string;
  };
}

export default function ContentRevisions() {
  const [searchParams] = useSearchParams();
  const entityType = searchParams.get("type");
  const entityId = searchParams.get("id");

  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [previewRevision, setPreviewRevision] = useState<Revision | null>(null);

  useEffect(() => {
    if (entityType && entityId) {
      loadRevisions();
    }
  }, [entityType, entityId]);

  async function loadRevisions() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("content_revisions")
        .select(`
          *,
          profiles:changed_by (
            full_name
          )
        `)
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("changed_at", { ascending: false });

      if (error) throw error;
      setRevisions(data || []);
    } catch (error) {
      console.error("Error loading revisions:", error);
      toast.error("Eroare la încărcarea istoricului");
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(revision: Revision) {
    if (!confirm(`Sigur vrei să restaurezi versiunea #${revision.revision_number}?`)) {
      return;
    }

    setRestoring(true);
    try {
      const table = entityType === "blog_article" ? "blog_articles" : "objectives";
      
      const { error } = await supabase
        .from(table)
        .update(revision.content_snapshot)
        .eq("id", entityId);

      if (error) throw error;

      toast.success("Versiune restaurată cu succes!");
      
      // Create a new revision for the restore action
      await supabase.from("content_revisions").insert({
        entity_type: entityType,
        entity_id: entityId,
        content_snapshot: revision.content_snapshot,
        change_summary: `Restored from revision #${revision.revision_number}`,
        revision_number: revisions.length + 1,
      });

      loadRevisions();
    } catch (error: any) {
      console.error("Error restoring revision:", error);
      toast.error("Eroare la restaurarea versiunii");
    } finally {
      setRestoring(false);
    }
  }

  if (!entityType || !entityId) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Content Revisions" }]} />
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Selectează un conținut pentru a vedea istoricul
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Content Revisions" }]} />

      <div>
        <h2 className="text-3xl font-display font-bold">Istoricul Modificărilor</h2>
        <p className="text-muted-foreground">
          Toate versiunile salvate pentru acest conținut
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : revisions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nicio versiune salvată
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {revisions.map((revision) => (
            <Card key={revision.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        <History className="mr-1 h-3 w-3" />
                        Versiunea #{revision.revision_number}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(revision.changed_at), "dd MMM yyyy, HH:mm")}
                      </span>
                    </div>

                    <p className="text-sm mb-1">
                      <strong>Modificat de:</strong>{" "}
                      {revision.profiles?.full_name || "Necunoscut"}
                    </p>

                    {revision.change_summary && (
                      <p className="text-sm text-muted-foreground">
                        {revision.change_summary}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewRevision(revision)}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(revision)}
                      disabled={restoring}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Restaurează
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewRevision} onOpenChange={() => setPreviewRevision(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Preview Versiunea #{previewRevision?.revision_number}
            </DialogTitle>
            <DialogDescription>
              {previewRevision &&
                format(new Date(previewRevision.changed_at), "dd MMM yyyy, HH:mm")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {previewRevision && (
              <>
                <div>
                  <strong>Titlu:</strong>
                  <p>{previewRevision.content_snapshot.title}</p>
                </div>
                {previewRevision.content_snapshot.description && (
                  <div>
                    <strong>Descriere:</strong>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: previewRevision.content_snapshot.description,
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewRevision(null)}>
              Închide
            </Button>
            {previewRevision && (
              <Button onClick={() => handleRestore(previewRevision)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Restaurează Această Versiune
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
