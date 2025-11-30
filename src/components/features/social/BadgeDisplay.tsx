import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Star, Crown, Medal } from "lucide-react";

interface BadgeDisplayProps {
  badges: Array<{
    id: string;
    badge_name: string;
    badge_description?: string;
    badge_icon?: string;
    earned_at: string;
  }>;
}

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case "trophy":
        return <Trophy className="h-4 w-4" />;
      case "star":
        return <Star className="h-4 w-4" />;
      case "crown":
        return <Crown className="h-4 w-4" />;
      case "medal":
        return <Medal className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <Badge
          key={badge.id}
          variant="secondary"
          className="flex items-center gap-1"
          title={badge.badge_description}
        >
          {getIcon(badge.badge_icon)}
          {badge.badge_name}
        </Badge>
      ))}
      {badges.length === 0 && (
        <p className="text-sm text-muted-foreground">No badges earned yet</p>
      )}
    </div>
  );
}
