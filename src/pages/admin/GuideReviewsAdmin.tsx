import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { getAllReviews, getPendingReviewsCount } from "@/lib/supabase/queries/reviews";
import { 
  approveReview, 
  rejectReview, 
  bulkApproveReviews,
  bulkDeleteReviews,
  deleteReview 
} from "@/lib/supabase/mutations/reviews";
import { toast } from "sonner";
import { Search, CheckCircle, XCircle, Trash2, Star, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { ADMIN_ROUTES } from "@/lib/constants/routes";
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
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function GuideReviewsAdmin() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-guide-reviews", statusFilter],
    queryFn: () => getAllReviews({
      approved: statusFilter === "all" ? undefined : statusFilter === "approved",
    }),
  });

  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["pending-guide-reviews-count"],
    queryFn: () => getPendingReviewsCount(),
  });

  const reviews = Array.isArray(data) ? data : (data?.reviews || []);

  const approveMutation = useMutation({
    mutationFn: approveReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-guide-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["pending-guide-reviews-count"] });
      toast.success("Recenzie aprobată cu succes");
    },
    onError: (error: any) => {
      toast.error(error.message || "Eroare la aprobarea recenziei");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-guide-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["pending-guide-reviews-count"] });
      toast.success("Recenzie respinsă");
    },
    onError: (error: any) => {
      toast.error(error.message || "Eroare la respingere");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-guide-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["pending-guide-reviews-count"] });
      toast.success("Recenzie ștearsă");
    },
    onError: (error: any) => {
      toast.error(error.message || "Eroare la ștergere");
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: bulkApproveReviews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-guide-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["pending-guide-reviews-count"] });
      toast.success("Recenzii aprobate cu succes");
      setSelectedReviews([]);
    },
    onError: (error: any) => {
      toast.error(error.message || "Eroare la aprobarea recenziilor");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteReviews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-guide-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["pending-guide-reviews-count"] });
      toast.success("Recenzii șterse cu succes");
      setSelectedReviews([]);
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Eroare la ștergerea recenziilor");
    },
  });

  const filteredReviews = reviews.filter((review: any) => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        review.guides?.full_name?.toLowerCase().includes(searchLower) ||
        review.title?.toLowerCase().includes(searchLower) ||
        review.comment?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const toggleSelectReview = (id: string) => {
    setSelectedReviews((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReviews.length === filteredReviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(filteredReviews.map((r: any) => r.id));
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Admin", href: ADMIN_ROUTES.dashboard },
          { label: "Recenzii Ghizi", href: ADMIN_ROUTES.guideReviews },
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recenzii Ghizi</h1>
          <p className="text-muted-foreground">
            Gestionează recenziile ghizilor profesioniști
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge variant="destructive" className="text-lg px-4 py-2">
              {pendingCount} În Așteptare
            </Badge>
          )}
          {selectedReviews.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => bulkApproveMutation.mutate(selectedReviews)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprobă ({selectedReviews.length})
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Șterge ({selectedReviews.length})
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută recenzii..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate</SelectItem>
            <SelectItem value="pending">În așteptare</SelectItem>
            <SelectItem value="approved">Aprobate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedReviews.length === filteredReviews?.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Ghid</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Recenzie</TableHead>
                <TableHead>Utilizator</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Nu există recenzii
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review: any) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review.id)}
                        onChange={() => toggleSelectReview(review.id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      {review.guides ? (
                        <Link
                          to={`/ghid/${review.guides.slug}`}
                          className="font-medium hover:underline flex items-center gap-1"
                        >
                          {review.guides.full_name}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Ghid necunoscut</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        {review.title && (
                          <div className="font-medium text-sm">{review.title}</div>
                        )}
                        {review.comment && (
                          <div className="text-sm text-muted-foreground truncate">
                            {review.comment}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.profiles?.avatar_url} />
                          <AvatarFallback>
                            {review.profiles?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {review.profiles?.full_name || "Utilizator necunoscut"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(review.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={review.approved ? "default" : "secondary"}>
                        {review.approved ? "Aprobat" : "În așteptare"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!review.approved && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => approveMutation.mutate(review.id)}
                            title="Aprobă"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {review.approved && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => rejectMutation.mutate(review.id)}
                            title="Respinge"
                          >
                            <XCircle className="h-4 w-4 text-orange-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Sigur vrei să ștergi această recenzie?")) {
                              deleteMutation.mutate(review.id);
                            }
                          }}
                          title="Șterge"
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge recenziile?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune nu poate fi anulată. Vei șterge {selectedReviews.length}{" "}
              recenzii.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkDeleteMutation.mutate(selectedReviews)}
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
