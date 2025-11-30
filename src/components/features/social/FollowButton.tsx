import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isFollowing } from "@/lib/supabase/queries/social";
import { toggleFollow } from "@/lib/supabase/mutations/social";
import { toast } from "sonner";

interface FollowButtonProps {
  userId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function FollowButton({ userId, variant = "default", size = "default" }: FollowButtonProps) {
  const queryClient = useQueryClient();

  const { data: following, isLoading } = useQuery({
    queryKey: ["isFollowing", userId],
    queryFn: () => isFollowing(userId),
  });

  const mutation = useMutation({
    mutationFn: () => toggleFollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isFollowing", userId] });
      queryClient.invalidateQueries({ queryKey: ["followStats", userId] });
      toast.success(following ? "Unfollowed successfully" : "Followed successfully");
    },
    onError: () => {
      toast.error("Failed to update follow status");
    },
  });

  if (isLoading) {
    return <Button variant={variant} size={size} disabled>Loading...</Button>;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      {following ? (
        <>
          <UserMinus className="mr-2 h-4 w-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
}
