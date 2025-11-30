import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPendingSuggestions } from "@/lib/supabase/queries/suggestions";
import { approveSuggestion, rejectSuggestion } from "@/lib/supabase/mutations/suggestions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Lightbulb, Check, X, MapPin, Link as LinkIcon, Image } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function SuggestionsAdmin() {
  const queryClient = useQueryClient();
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<"approve" | "reject">("approve");

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["pendingSuggestions"],
    queryFn: getPendingSuggestions,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => approveSuggestion(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingSuggestions"] });
      toast.success("Suggestion approved!");
      setDialogOpen(false);
      setAdminNotes("");
    },
    onError: () => {
      toast.error("Failed to approve suggestion");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => rejectSuggestion(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingSuggestions"] });
      toast.success("Suggestion rejected");
      setDialogOpen(false);
      setAdminNotes("");
    },
    onError: () => {
      toast.error("Failed to reject suggestion");
    },
  });

  const handleAction = () => {
    if (!selectedSuggestion) return;

    if (action === "approve") {
      approveMutation.mutate({ id: selectedSuggestion.id, notes: adminNotes });
    } else {
      if (!adminNotes.trim()) {
        toast.error("Please provide a reason for rejection");
        return;
      }
      rejectMutation.mutate({ id: selectedSuggestion.id, notes: adminNotes });
    }
  };

  const openDialog = (suggestion: any, actionType: "approve" | "reject") => {
    setSelectedSuggestion(suggestion);
    setAction(actionType);
    setAdminNotes("");
    setDialogOpen(true);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Lightbulb className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Objective Suggestions</h1>
          <p className="text-muted-foreground">
            Review and approve user-submitted suggestions
          </p>
        </div>
      </div>

      {!suggestions || suggestions.length === 0 ? (
        <Card className="p-12 text-center">
          <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No pending suggestions</h3>
          <p className="text-muted-foreground">All suggestions have been reviewed</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {suggestions.map((suggestion: any) => (
            <Card key={suggestion.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{suggestion.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {suggestion.location_city && `${suggestion.location_city}, `}
                        {suggestion.location_country}
                      </div>
                      {suggestion.website_url && (
                        <a
                          href={suggestion.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <LinkIcon className="h-4 w-4" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description:</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {suggestion.description}
                  </p>
                </div>

                {suggestion.images && suggestion.images.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Photos:</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {suggestion.images.map((img: string, idx: number) => (
                        <div key={idx} className="aspect-video overflow-hidden rounded-md">
                          <img
                            src={img}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(suggestion.latitude && suggestion.longitude) && (
                  <div>
                    <h4 className="font-semibold mb-1">GPS Coordinates:</h4>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.latitude}, {suggestion.longitude}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Submitted by {suggestion.user?.full_name} on{" "}
                    {format(new Date(suggestion.created_at), "MMM dd, yyyy")}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => openDialog(suggestion, "reject")}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button onClick={() => openDialog(suggestion, "approve")}>
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve" : "Reject"} Suggestion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">
                {action === "approve" ? "Admin Notes (optional)" : "Rejection Reason *"}
              </Label>
              <Textarea
                id="notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  action === "approve"
                    ? "Any notes about this suggestion..."
                    : "Explain why this suggestion is being rejected..."
                }
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                variant={action === "reject" ? "destructive" : "default"}
              >
                {action === "approve" ? "Approve" : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
