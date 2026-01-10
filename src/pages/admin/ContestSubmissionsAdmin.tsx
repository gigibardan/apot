import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getContestBySlug, 
  getAllContestSubmissions, 
  getContestStats 
} from "@/lib/supabase/queries/contests";
import { 
  approveSubmission, 
  rejectSubmission, 
  removeSubmission 
} from "@/lib/supabase/mutations/contests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { 
  ArrowLeft, 
  Check, 
  X, 
  AlertTriangle, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  Trash2,
  Vote
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type SubmissionStatus = "pending" | "approved" | "rejected" | "removed";

export default function ContestSubmissionsAdmin() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [modalType, setModalType] = useState<"approve" | "reject" | "remove" | "view" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [removeReason, setRemoveReason] = useState("");
  const [confirmFraud, setConfirmFraud] = useState(false);

  // Fetch contest by ID
  const { data: contest, isLoading: loadingContest } = useQuery({
    queryKey: ["adminContest", id],
    queryFn: async () => {
      const { data, error } = await (await import("@/integrations/supabase/client")).supabase
        .from("photo_contests")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: submissions, isLoading: loadingSubmissions } = useQuery({
    queryKey: ["adminSubmissions", id, activeTab],
    queryFn: () => getAllContestSubmissions(id!, activeTab === "all" ? undefined : activeTab),
    enabled: !!id,
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["contestStats", id],
    queryFn: () => getContestStats(id!),
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: () => approveSubmission(selectedSubmission.id, adminNotes || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["contestStats"] });
      toast.success("Submission aprobat cu succes!");
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.message || "Eroare la aprobare");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectSubmission(selectedSubmission.id, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["contestStats"] });
      toast.success("Submission respins!");
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.message || "Eroare la respingere");
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => removeSubmission(selectedSubmission.id, removeReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["contestStats"] });
      toast.success("Submission eliminat pentru fraudă!");
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.message || "Eroare la eliminare");
    },
  });

  const openModal = (submission: any, type: "approve" | "reject" | "remove" | "view") => {
    setSelectedSubmission(submission);
    setModalType(type);
    setAdminNotes("");
    setRejectionReason("");
    setRemoveReason("");
    setConfirmFraud(false);
  };

  const closeModal = () => {
    setSelectedSubmission(null);
    setModalType(null);
    setAdminNotes("");
    setRejectionReason("");
    setRemoveReason("");
    setConfirmFraud(false);
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      case "removed":
        return <Badge variant="destructive"><Trash2 className="mr-1 h-3 w-3" />Removed</Badge>;
      default:
        return null;
    }
  };

  if (loadingContest) {
    return <LoadingSpinner />;
  }

  if (!contest) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Contest nu a fost găsit</h2>
        <Link to="/admin/contests">
          <Button><ArrowLeft className="mr-2 h-4 w-4" />Înapoi la Concursuri</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link to="/admin/contests" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />Înapoi la Concursuri
          </Link>
          <h1 className="text-3xl font-bold">{contest.title}</h1>
          <p className="text-muted-foreground">{contest.theme}</p>
        </div>
        <Badge variant={contest.status === "active" ? "default" : "secondary"}>
          {contest.status}
        </Badge>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-destructive">{stats.removed}</p>
              <p className="text-sm text-muted-foreground">Removed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {stats?.pending ? <Badge variant="secondary">{stats.pending}</Badge> : null}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loadingSubmissions ? (
            <LoadingSpinner />
          ) : !submissions || submissions.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Nicio submission în această categorie</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map((submission: any) => (
                <Card key={submission.id} className="overflow-hidden">
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={submission.image_url}
                      alt={submission.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(submission.status)}
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold line-clamp-1">{submission.title}</h3>
                    
                    {submission.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {submission.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={submission.user?.avatar_url} />
                        <AvatarFallback>{submission.user?.full_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {submission.user?.full_name || submission.user?.username || "Unknown"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{format(new Date(submission.created_at), "dd MMM yyyy HH:mm")}</span>
                      {submission.status === "approved" && (
                        <span className="flex items-center gap-1">
                          <Vote className="h-3 w-3" />
                          {submission.votes_count || 0} voturi
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {submission.status === "pending" && (
                        <>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => openModal(submission, "approve")}
                          >
                            <Check className="mr-1 h-4 w-4" />Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="flex-1"
                            onClick={() => openModal(submission, "reject")}
                          >
                            <X className="mr-1 h-4 w-4" />Reject
                          </Button>
                        </>
                      )}
                      {submission.status === "approved" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => openModal(submission, "view")}
                          >
                            <Eye className="mr-1 h-4 w-4" />View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="flex-1"
                            onClick={() => openModal(submission, "remove")}
                          >
                            <AlertTriangle className="mr-1 h-4 w-4" />Fraud
                          </Button>
                        </>
                      )}
                      {submission.status === "rejected" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                          onClick={() => openModal(submission, "view")}
                        >
                          <Eye className="mr-1 h-4 w-4" />View Reason
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approve Modal */}
      <Dialog open={modalType === "approve"} onOpenChange={() => closeModal()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Approve Submission</DialogTitle>
            <DialogDescription>
              Această submisie va fi vizibilă public și eligibilă pentru vot.
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={selectedSubmission.image_url}
                  alt={selectedSubmission.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold">{selectedSubmission.title}</h3>
              <div>
                <Label htmlFor="adminNotes">Admin Notes (opțional, nu vede user-ul)</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Note interne pentru administrare..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>
              <Check className="mr-2 h-4 w-4" />Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={modalType === "reject"} onOpenChange={() => closeModal()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              User-ul va vedea motivul respingerii.
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={selectedSubmission.image_url}
                  alt={selectedSubmission.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold">{selectedSubmission.title}</h3>
              <div>
                <Label htmlFor="rejectionReason">Motivul Respingerii *</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explică de ce submisia a fost respinsă..."
                  rows={3}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Acest mesaj va fi vizibil pentru utilizator.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={() => rejectMutation.mutate()} 
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
            >
              <X className="mr-2 h-4 w-4" />Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove (Fraud) Modal */}
      <Dialog open={modalType === "remove"} onOpenChange={() => closeModal()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              <AlertTriangle className="inline mr-2 h-5 w-5" />
              Remove Submission - Fraud Detection
            </DialogTitle>
            <DialogDescription>
              Această acțiune va elimina submisia și toate voturile asociate.
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={selectedSubmission.image_url}
                  alt={selectedSubmission.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold">{selectedSubmission.title}</h3>
              <div>
                <Label htmlFor="removeReason">Motivul Eliminării *</Label>
                <Textarea
                  id="removeReason"
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  placeholder="Explică motivul eliminării pentru fraudă..."
                  rows={3}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="confirmFraud" 
                  checked={confirmFraud}
                  onCheckedChange={(checked) => setConfirmFraud(checked as boolean)}
                />
                <label htmlFor="confirmFraud" className="text-sm">
                  Confirm că aceasta este fraudă și necesită eliminare
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={() => removeMutation.mutate()} 
              disabled={removeMutation.isPending || !removeReason.trim() || !confirmFraud}
            >
              <Trash2 className="mr-2 h-4 w-4" />Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={modalType === "view"} onOpenChange={() => closeModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={selectedSubmission.image_url}
                  alt={selectedSubmission.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{selectedSubmission.title}</h3>
                {getStatusBadge(selectedSubmission.status)}
              </div>
              {selectedSubmission.description && (
                <p className="text-muted-foreground">{selectedSubmission.description}</p>
              )}
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedSubmission.user?.avatar_url} />
                  <AvatarFallback>{selectedSubmission.user?.full_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedSubmission.user?.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Trimis: {format(new Date(selectedSubmission.created_at), "dd MMM yyyy HH:mm")}
                  </p>
                </div>
              </div>
              {selectedSubmission.status === "rejected" && selectedSubmission.rejection_reason && (
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-destructive mb-2">Motiv Respingere</h4>
                  <p>{selectedSubmission.rejection_reason}</p>
                </div>
              )}
              {selectedSubmission.status === "removed" && selectedSubmission.rejection_reason && (
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-destructive mb-2">Motiv Eliminare (Fraud)</h4>
                  <p>{selectedSubmission.rejection_reason}</p>
                </div>
              )}
              {selectedSubmission.votes_count > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Vote className="h-4 w-4" />
                  {selectedSubmission.votes_count} voturi
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Închide</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
