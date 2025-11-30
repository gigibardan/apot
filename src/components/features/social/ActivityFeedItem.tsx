import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, MapPin, Trophy, Award, User } from "lucide-react";

interface ActivityFeedItemProps {
  activity: {
    id: string;
    activity_type: string;
    target_type: string;
    target_id: string;
    metadata: any;
    created_at: string;
    user: {
      id: string;
      full_name: string;
      username?: string;
      avatar_url?: string;
    };
  };
}

export function ActivityFeedItem({ activity }: ActivityFeedItemProps) {
  const getActivityIcon = () => {
    switch (activity.activity_type) {
      case "favorite_added":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "review_posted":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "post_created":
      case "reply_created":
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case "journal_published":
        return <MapPin className="h-4 w-4 text-purple-500" />;
      case "challenge_completed":
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case "badge_earned":
        return <Award className="h-4 w-4 text-orange-500" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getActivityText = () => {
    switch (activity.activity_type) {
      case "favorite_added":
        return "added an objective to favorites";
      case "review_posted":
        return "posted a review";
      case "post_created":
        return "created a forum post";
      case "reply_created":
        return "replied to a discussion";
      case "journal_published":
        return "published a travel journal";
      case "challenge_completed":
        return "completed a challenge";
      case "badge_earned":
        return "earned a new badge";
      default:
        return "performed an action";
    }
  };

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <Link to={`/user/${activity.user.username || activity.user.id}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={activity.user.avatar_url} alt={activity.user.full_name} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {getActivityIcon()}
            <p className="text-sm">
              <Link
                to={`/user/${activity.user.username || activity.user.id}`}
                className="font-semibold hover:underline"
              >
                {activity.user.full_name}
              </Link>{" "}
              <span className="text-muted-foreground">{getActivityText()}</span>
            </p>
          </div>
          {activity.metadata?.title && (
            <p className="text-sm font-medium mt-1">{activity.metadata.title}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </Card>
  );
}
