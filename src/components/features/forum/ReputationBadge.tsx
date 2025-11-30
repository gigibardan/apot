import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getUserReputation, getUserBadge } from "@/lib/supabase/queries/reputation";

interface ReputationBadgeProps {
  userId: string;
  showPoints?: boolean;
}

export function ReputationBadge({ userId, showPoints = true }: ReputationBadgeProps) {
  const { data: reputation, isLoading } = useQuery({
    queryKey: ['user-reputation', userId],
    queryFn: () => getUserReputation(userId),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return <Badge variant="secondary" className="gap-1 animate-pulse">...</Badge>;
  }

  if (!reputation) {
    return null;
  }

  const badge = getUserBadge(reputation.reputation_points);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className={`gap-1 ${badge.color}`}>
            <span>{badge.icon}</span>
            <span>{badge.name}</span>
            {showPoints && <span className="ml-1 opacity-70">({reputation.reputation_points})</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm space-y-1">
            <p><strong>{reputation.reputation_points}</strong> puncte reputație</p>
            <p>{reputation.posts_count} postări</p>
            <p>{reputation.replies_count} răspunsuri</p>
            <p>{reputation.helpful_count} voturi utile</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
