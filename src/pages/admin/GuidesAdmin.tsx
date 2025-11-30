import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ADMIN_ROUTES } from "@/lib/constants/routes";
import { getGuides } from "@/lib/supabase/queries/guides";
import { deleteGuide } from "@/lib/supabase/mutations/guides";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Star, 
  Shield, 
  Eye
} from "lucide-react";
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
import Breadcrumbs from "@/components/admin/Breadcrumbs";

export default function GuidesAdmin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-guides", search],
    queryFn: () => getGuides({ search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGuide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-guides"] });
      toast.success("Ghidul a fost șters cu succes");
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Eroare la ștergerea ghidului");
    },
  });

  const guides = data?.guides || [];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Admin", href: ADMIN_ROUTES.dashboard },
          { label: "Ghizi Profesioniști", href: ADMIN_ROUTES.guides },
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ghizi Profesioniști</h1>
          <p className="text-muted-foreground">
            Gestionează ghizii verificați din platformă
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(ADMIN_ROUTES.authorizedGuides)}
          >
            <Shield className="h-4 w-4 mr-2" />
            Ghizi Autorizați
          </Button>
          <Button onClick={() => navigate(ADMIN_ROUTES.guidesCreate)}>
            <Plus className="h-4 w-4 mr-2" />
            Adaugă Ghid
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută ghizi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ghid</TableHead>
                <TableHead>Specializări</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nu există ghizi
                  </TableCell>
                </TableRow>
              ) : (
                guides.map((guide) => (
                  <TableRow key={guide.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {guide.profile_image && (
                          <img
                            src={guide.profile_image}
                            alt={guide.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{guide.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {guide.years_experience} ani experiență
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {guide.specializations?.slice(0, 2).map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {guide.specializations?.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{guide.specializations.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {guide.geographical_areas?.slice(0, 2).join(", ")}
                        {guide.geographical_areas?.length > 2 &&
                          ` +${guide.geographical_areas.length - 2}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{guide.rating_average.toFixed(1)}</span>
                        <span className="text-muted-foreground text-sm">
                          ({guide.reviews_count})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {guide.verified && (
                          <Badge variant="default" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Verificat
                          </Badge>
                        )}
                        {guide.featured && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {!guide.active && (
                          <Badge variant="destructive" className="text-xs">
                            Inactiv
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            window.open(`/ghid/${guide.slug}`, "_blank")
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(ADMIN_ROUTES.guidesEdit(guide.id))}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(guide.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge ghidul?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune nu poate fi anulată. Toate recenziile și relațiile cu
              obiectivele vor fi șterse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
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
