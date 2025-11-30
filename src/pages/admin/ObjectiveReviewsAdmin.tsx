/**
 * Admin Objective Reviews Management Page
 * Moderate and manage reviews for objectives
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Check, X, Trash2, Star, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  getAllObjectiveReviews,
  getPendingObjectiveReviewsCount,
} from "@/lib/supabase/queries/objective-reviews";
import {
  approveObjectiveReview,
  rejectObjectiveReview,
  bulkApproveObjectiveReviews,
  bulkDeleteObjectiveReviews,
} from "@/lib/supabase/mutations/objective-reviews";

export default function ObjectiveReviewsAdmin() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("pending");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch reviews
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const filters: any = {
        page: currentPage,
        limit: 20,
      };

      if (statusFilter === "pending") filters.approved = false;
      if (statusFilter === "approved") filters.approved = true;
      if (ratingFilter !== "all") {
        filters.minRating = parseInt(ratingFilter);
        filters.maxRating = parseInt(ratingFilter);
      }
      if (searchTerm) filters.search = searchTerm;

      const { reviews: data, pages } = await getAllObjectiveReviews(filters);
      const pendingTotal = await getPendingObjectiveReviewsCount();

      setReviews(data);
      setTotalPages(pages);
      setPendingCount(pendingTotal);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [currentPage, statusFilter, ratingFilter]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchReviews();
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedReviews(newSelected);
  };

  // Select all
  const toggleSelectAll = () => {
    if (selectedReviews.size === reviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(reviews.map((r) => r.id)));
    }
  };

  // Approve single review
  const handleApprove = async (id: string) => {
    try {
      await approveObjectiveReview(id);
      fetchReviews();
    } catch (error) {
      console.error("Error approving review:", error);
    }
  };

  // Reject single review
  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await rejectObjectiveReview(id);
      fetchReviews();
    } catch (error) {
      console.error("Error rejecting review:", error);
    }
  };

  // Bulk approve
  const handleBulkApprove = async () => {
    if (selectedReviews.size === 0) return;

    try {
      await bulkApproveObjectiveReviews(Array.from(selectedReviews));
      setSelectedReviews(new Set());
      fetchReviews();
    } catch (error) {
      console.error("Error bulk approving:", error);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedReviews.size === 0) return;
    if (!confirm(`Delete ${selectedReviews.size} selected reviews?`)) return;

    try {
      await bulkDeleteObjectiveReviews(Array.from(selectedReviews));
      setSelectedReviews(new Set());
      fetchReviews();
    } catch (error) {
      console.error("Error bulk deleting:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Recenzii Obiective</h1>
            <p className="text-muted-foreground mt-1">
              Moderează recenziile pentru obiective turistice
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge variant="destructive" className="text-lg px-4 py-2">
              {pendingCount} În Așteptare
            </Badge>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Caută în recenzii..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch} size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(value: any) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate</SelectItem>
                  <SelectItem value="pending">În Așteptare</SelectItem>
                  <SelectItem value="approved">Aprobate</SelectItem>
                </SelectContent>
              </Select>

              {/* Rating Filter */}
              <Select
                value={ratingFilter}
                onValueChange={(value) => {
                  setRatingFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toate Rating-urile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate Rating-urile</SelectItem>
                  <SelectItem value="5">5 Stele</SelectItem>
                  <SelectItem value="4">4 Stele</SelectItem>
                  <SelectItem value="3">3 Stele</SelectItem>
                  <SelectItem value="2">2 Stele</SelectItem>
                  <SelectItem value="1">1 Stea</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedReviews.size > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedReviews.size} recenzii selectate
                </span>
                <div className="flex gap-2">
                  <Button onClick={handleBulkApprove} size="sm" variant="default">
                    <Check className="h-4 w-4 mr-1" />
                    Aprobă
                  </Button>
                  <Button onClick={handleBulkDelete} size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Șterge
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recenzii</CardTitle>
              {reviews.length > 0 && (
                <Button onClick={toggleSelectAll} variant="outline" size="sm">
                  {selectedReviews.size === reviews.length ? "Deselectează Tot" : "Selectează Tot"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-12 text-muted-foreground">Se încarcă...</p>
            ) : reviews.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">Nu există recenzii</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition"
                  >
                    {/* Checkbox */}
                    <div className="pt-1">
                      <Checkbox
                        checked={selectedReviews.has(review.id)}
                        onCheckedChange={() => toggleSelection(review.id)}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.profiles?.avatar_url} />
                            <AvatarFallback>
                              {review.profiles?.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {review.profiles?.full_name || "Anonymous"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(review.created_at)}
                            </p>
                          </div>
                        </div>

                        {/* Rating & Status */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "h-4 w-4",
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                )}
                              />
                            ))}
                          </div>
                          {review.approved ? (
                            <Badge variant="default">Aprobat</Badge>
                          ) : (
                            <Badge variant="secondary">În Așteptare</Badge>
                          )}
                        </div>
                      </div>

                      {/* Objective */}
                      {review.objectives && (
                        <Link
                          to={`/obiective/${review.objectives.slug}`}
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          {review.objectives.title}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}

                      {/* Review Content */}
                      {review.title && <p className="font-semibold">{review.title}</p>}
                      {review.comment && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {review.comment}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {!review.approved && (
                          <Button
                            onClick={() => handleApprove(review.id)}
                            size="sm"
                            variant="default"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Aprobă
                          </Button>
                        )}
                        <Button
                          onClick={() => handleReject(review.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Șterge
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4">
              Pagina {currentPage} din {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Următor
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
