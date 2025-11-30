import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { Target, Plus, Trophy, Award } from "lucide-react";
import { toast } from "sonner";

export default function ChallengesAdmin() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    challenge_type: "visit_count" as any,
    target_value: 5,
    reward_type: "badge" as any,
    reward_points: 0,
    reward_badge_name: "",
    icon: "Trophy",
    active: true,
  });

  const { data: challenges, isLoading } = useQuery({
    queryKey: ["adminChallenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_challenges")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("community_challenges").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminChallenges"] });
      toast.success("Challenge creat cu succes!");
      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        challenge_type: "visit_count",
        target_value: 5,
        reward_type: "badge",
        reward_points: 0,
        reward_badge_name: "",
        icon: "Trophy",
        active: true,
      });
    },
    onError: () => {
      toast.error("Eroare la crearea challenge-ului");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("community_challenges")
        .update({ active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminChallenges"] });
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
          <Target className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Community Challenges</h1>
            <p className="text-muted-foreground">Gestionează provocările comunității</p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Challenge Nou
        </Button>
      </div>

      {!challenges || challenges.length === 0 ? (
        <Card className="p-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Niciun challenge</h3>
          <p className="text-muted-foreground mb-4">Creează primul challenge!</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adaugă Challenge
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {challenges.map((challenge: any) => (
            <Card key={challenge.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {challenge.icon === "Trophy" ? (
                      <Trophy className="h-6 w-6 text-primary" />
                    ) : (
                      <Award className="h-6 w-6 text-primary" />
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{challenge.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                  </div>
                  <Badge variant={challenge.active ? "default" : "outline"}>
                    {challenge.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium">{challenge.challenge_type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target:</span>
                    <p className="font-medium">{challenge.target_value}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reward:</span>
                    <p className="font-medium">
                      {challenge.reward_type === "points"
                        ? `${challenge.reward_points} points`
                        : challenge.reward_badge_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium">
                      {challenge.active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    toggleActiveMutation.mutate({
                      id: challenge.id,
                      active: !challenge.active,
                    })
                  }
                >
                  {challenge.active ? "Dezactivează" : "Activează"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Challenge Nou</DialogTitle>
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
              <Label htmlFor="description">Descriere *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="challenge_type">Tip Challenge *</Label>
                <Select
                  value={formData.challenge_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, challenge_type: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visit_count">Visit Count</SelectItem>
                    <SelectItem value="review_count">Review Count</SelectItem>
                    <SelectItem value="favorite_count">Favorite Count</SelectItem>
                    <SelectItem value="post_count">Post Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="target_value">Target Value *</Label>
                <Input
                  id="target_value"
                  type="number"
                  min="1"
                  value={formData.target_value}
                  onChange={(e) =>
                    setFormData({ ...formData, target_value: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reward_type">Tip Reward *</Label>
                <Select
                  value={formData.reward_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, reward_type: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="badge">Badge</SelectItem>
                    <SelectItem value="points">Points</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reward_points">Reward Points</Label>
                <Input
                  id="reward_points"
                  type="number"
                  min="0"
                  value={formData.reward_points}
                  onChange={(e) =>
                    setFormData({ ...formData, reward_points: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="reward_badge_name">Badge Name</Label>
              <Input
                id="reward_badge_name"
                value={formData.reward_badge_name}
                onChange={(e) =>
                  setFormData({ ...formData, reward_badge_name: e.target.value })
                }
                placeholder="Explorer Badge"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Anulează
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Creează Challenge
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
