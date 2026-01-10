import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Plus, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ContestsAdmin() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    theme: "",
    prizes_description: "",
    cover_image: "",
    start_date: "",
    end_date: "",
    voting_end_date: "",
  });

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
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("photo_contests").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminContests"] });
      toast.success("Contest creat cu succes!");
      setDialogOpen(false);
      setFormData({
        title: "",
        slug: "",
        description: "",
        theme: "",
        prizes_description: "",
        cover_image: "",
        start_date: "",
        end_date: "",
        voting_end_date: "",
      });
    },
    onError: () => {
      toast.error("Eroare la crearea contestului");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
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
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Contest Nou
        </Button>
      </div>

      {!contests || contests.length === 0 ? (
        <Card className="p-12 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Niciun contest</h3>
          <p className="text-muted-foreground mb-4">Creează primul contest foto!</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adaugă Contest
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {contests.map((contest: any) => (
            <Card key={contest.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{contest.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{contest.theme}</p>
                  </div>
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
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {contest.description}
                </p>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Start: {format(new Date(contest.start_date), "dd MMM yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>End: {format(new Date(contest.end_date), "dd MMM yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Voting: {format(new Date(contest.voting_end_date), "dd MMM yyyy")}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() =>
                      updateStatusMutation.mutate({ id: contest.id, status: "active" })
                    }
                    disabled={contest.status === "active"}
                  >
                    Activează
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      updateStatusMutation.mutate({ id: contest.id, status: "voting" })
                    }
                    disabled={contest.status === "voting"}
                  >
                    Votare
                  </Button>
                  <Button
                    variant="outline"
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contest Nou</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Titlu *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="contest-summer-2024"
                required
              />
            </div>
            <div>
              <Label htmlFor="theme">Temă</Label>
              <Input
                id="theme"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                placeholder="Best Landscape Photo"
              />
            </div>
            <div>
              <Label htmlFor="description">Descriere</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="prizes">Premii</Label>
              <Textarea
                id="prizes"
                value={formData.prizes_description}
                onChange={(e) =>
                  setFormData({ ...formData, prizes_description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="cover_image">Cover Image URL</Label>
              <Input
                id="cover_image"
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="voting_end_date">Voting End *</Label>
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
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Anulează
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Creează Contest
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
