/**
 * ReviewsAdmin Page
 * Admin interface for moderating guide reviews
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllReviews } from "@/lib/supabase/queries/reviews";
import {
  approveReview,
  rejectReview,
  bulkApproveReviews,
  bulkDeleteReviews,
} from "@/lib/supabase/mutations/reviews";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Star,
  Check,
  X,
  Trash2,
  ExternalLink,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ReviewsAdmin() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");
  const [ratingFilter, setRatingFilter] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const pageSize = 20;

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews", statusFilter, ratingFilter, page],
    queryFn: () =>
      getAllReviews({
        approved: statusFilter === "all" ? undefined : statusFilter === "approved",
        rating: ratingFilter,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: approveReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Recenzia a fost aprobată!");
    },
    onError: () => {
      toast.error("Eroare la aprobare");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Recenzia a fost respinsă!");
    },
    onError: () => {
      toast.error("Eroare la respingere");
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: bulkApproveReviews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success(`${selectedReviews.length} recenzii aprobate!`);
      setSelectedReviews([]);
    },
    onError: () => {
      toast.error("Eroare la aprobare bulk");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteReviews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success(`${selectedReviews.length} recenzii șterse!`);
      setSelectedReviews([]);
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error("Eroare la ștergere");
    },
  });

  const reviews = data?.reviews || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const filteredReviews = reviews.filter((review: any) =>
    search
      ? review.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        review.guide?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        review.comment?.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const toggleSelectAll = () => {
    if (selectedReviews.length === filteredReviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(filteredReviews.map((r: any) => r.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedReviews((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recenzii Ghizi</h1>
          <p className="text-muted-foreground">Moderare și management recenzii</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{totalCount} total</Badge>
          {selectedReviews.length > 0 && (
            <>
              <Button
                size="sm"
                onClick={() => bulkApproveMutation.mutate(selectedReviews)}
                disabled={bulkApproveMutation.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                Aprobă ({selectedReviews.length})
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={bulkDeleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Șterge ({selectedReviews.length})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtre
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Caută după user, ghid sau comentariu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate</SelectItem>
              <SelectItem value="approved">Aprobate</SelectItem>
              <SelectItem value="pending">În așteptare</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={ratingFilter?.toString() || "all"}
            onValueChange={(v) => setRatingFilter(v === "all" ? undefined : Number(v))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate ratingurile</SelectItem>
              <SelectItem value="5">5 stele</SelectItem>
              <SelectItem value="4">4 stele</SelectItem>
              <SelectItem value="3">3 stele</SelectItem>
              <SelectItem value="2">2 stele</SelectItem>
              <SelectItem value="1">1 stea</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      filteredReviews.length > 0 &&
                      selectedReviews.length === filteredReviews.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Ghid</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comentariu</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">Nu există recenzii</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review: any) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedReviews.includes(review.id)}
                        onCheckedChange={() => toggleSelect(review.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{review.user?.full_name || "Anonim"}</div>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/ghid/${review.guide?.slug}`}
                        className="hover:underline flex items-center gap-1"
                      >
                        {review.guide?.full_name}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {review.title && <div className="font-medium">{review.title}</div>}
                      {review.comment && (
                        <div className="text-sm text-muted-foreground truncate">
                          {review.comment}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(review.created_at)}
                    </TableCell>
                    <TableCell>
                      {review.approved ? (
                        <Badge variant="default">Aprobat</Badge>
                      ) : (
                        <Badge variant="secondary">În așteptare</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!review.approved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveMutation.mutate(review.id)}
                            disabled={approveMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {review.approved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectMutation.mutate(review.id)}
                            disabled={rejectMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Pagina {page} din {totalPages} ({totalCount} total)
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Următorul
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
            <AlertDialogDescription>
              Vrei să ștergi {selectedReviews.length} recenzii? Această acțiune nu poate fi
              anulată.
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
