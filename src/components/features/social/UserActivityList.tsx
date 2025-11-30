/**
 * User Activity List Component
 * Displays user's recent activities in a timeline format
 * 
 * Features:
 * - Activity type icons and colors
 * - Relative timestamps
 * - Links to related content
 * - Loading and empty states
 */

import { useQuery } from "@tanstack/react-query";
import { getUserRecentActivity } from "@/lib/supabase/queries/social";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, 
  MessageSquare, 
  Star, 
  MapPin, 
  Award,
  UserPlus,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface UserActivityListProps {
  userId: string;
}

const activityConfig = {
  favorite_added: {
    icon: Heart,
    color: "text-red-500",
    label: "a adăugat la favorite"
  },
  review_posted: {
    icon: Star,
    color: "text-yellow-500",
    label: "a scris o recenzie"
  },
  forum_post: {
    icon: MessageSquare,
    color: "text-blue-500",
    label: "a creat un post"
  },
  forum_reply: {
    icon: MessageSquare,
    color: "text-blue-400",
    label: "a răspuns"
  },
  objective_visited: {
    icon: MapPin,
    color: "text-green-500",
    label: "a vizitat"
  },
  badge_earned: {
    icon: Award,
    color: "text-purple-500",
    label: "a câștigat un badge"
  },
  user_followed: {
    icon: UserPlus,
    color: "text-indigo-500",
    label: "urmărește"
  }
};

export function UserActivityList({ userId }: UserActivityListProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["userActivity", userId],
    queryFn: () => getUserRecentActivity(userId, 20)
  });

  if (isLoading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Nicio activitate încă</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const config = activityConfig[activity.activity_type as keyof typeof activityConfig] || {
          icon: MessageSquare,
          color: "text-muted-foreground",
          label: activity.activity_type
        };
        
        const Icon = config.icon;

        return (
          <Card key={activity.id} className="p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full bg-accent ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{config.label}</span>
                  {activity.metadata?.title && (
                    <span className="text-muted-foreground ml-1">
                      {activity.metadata.title}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}