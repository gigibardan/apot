import { useQuery } from "@tanstack/react-query";
import { getFollowStats } from "@/lib/supabase/queries/social";
import { Users } from "lucide-react";

interface FollowStatsProps {
  userId: string;
}

export function FollowStats({ userId }: FollowStatsProps) {
  const { data: stats } = useQuery({
    queryKey: ["followStats", userId],
    queryFn: () => getFollowStats(userId),
  });

  return (
    <div className="flex gap-6">
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">{stats?.followersCount || 0}</span>
        <span className="text-sm text-muted-foreground">Followers</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">{stats?.followingCount || 0}</span>
        <span className="text-sm text-muted-foreground">Following</span>
      </div>
    </div>
  );
}
