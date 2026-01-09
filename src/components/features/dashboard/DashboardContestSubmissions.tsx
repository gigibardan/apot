import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Camera, Clock, CheckCircle, XCircle, Trophy, Vote, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface DashboardContestSubmissionsProps {
  userId: string;
  limit?: number;
  compact?: boolean;
}

export function DashboardContestSubmissions({ userId, limit, compact = false }: DashboardContestSubmissionsProps) {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ["userContestSubmissions", userId],
    queryFn: async () => {
      let query = supabase
        .from("contest_submissions")
        .select(`
          id,
          title,
          image_url,
          status,
          rejection_reason,
          votes_count,
          winner_rank,
          created_at,
          contest:photo_contests(
            id,
            title,
            slug,
            status
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-8">
        <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">Nu ai participat la niciun concurs foto încă.</p>
        <Link to="/contests">
          <Button>
            <Camera className="mr-2 h-4 w-4" />
            Explorează Concursurile
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="mr-1 h-3 w-3" />În așteptare
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />Aprobat
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="mr-1 h-3 w-3" />Respins
          </Badge>
        );
      default:
        return null;
    }
  };

  const getWinnerBadge = (rank: number | null) => {
    if (!rank) return null;
    const badges: Record<number, { emoji: string; label: string; className: string }> = {
      1: { emoji: "🥇", label: "Loc 1", className: "bg-yellow-500 text-white" },
      2: { emoji: "🥈", label: "Loc 2", className: "bg-gray-400 text-white" },
      3: { emoji: "🥉", label: "Loc 3", className: "bg-amber-700 text-white" },
    };
    const badge = badges[rank];
    if (!badge) return null;
    return (
      <Badge className={badge.className}>
        {badge.emoji} {badge.label}
      </Badge>
    );
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {submissions.slice(0, limit || 3).map((submission: any) => (
          <div key={submission.id} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
              <img
                src={submission.image_url}
                alt={submission.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">{submission.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {submission.contest?.title}
              </p>
            </div>
            {getStatusBadge(submission.status)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            {submission.winner_rank && (
              <div className="absolute top-2 left-2">
                {getWinnerBadge(submission.winner_rank)}
              </div>
            )}
          </div>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold line-clamp-1">{submission.title}</h3>
            
            <Link 
              to={`/contests/${submission.contest?.slug}`}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {submission.contest?.title}
              <ExternalLink className="h-3 w-3" />
            </Link>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{format(new Date(submission.created_at), "dd MMM yyyy")}</span>
              {submission.status === "approved" && (
                <span className="flex items-center gap-1">
                  <Vote className="h-3 w-3" />
                  {submission.votes_count || 0} voturi
                </span>
              )}
            </div>

            {submission.status === "rejected" && submission.rejection_reason && (
              <div className="bg-red-50 dark:bg-red-950 p-2 rounded text-xs text-red-700 dark:text-red-300">
                <strong>Motiv:</strong> {submission.rejection_reason}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
