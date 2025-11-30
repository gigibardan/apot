import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { User } from "lucide-react";

interface UserCardProps {
  user: {
    id: string;
    full_name: string;
    username?: string;
    avatar_url?: string;
    bio?: string;
  };
  showBio?: boolean;
}

export function UserCard({ user, showBio = false }: UserCardProps) {
  return (
    <Link to={`/user/${user.username || user.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url} alt={user.full_name} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{user.full_name}</p>
            {user.username && (
              <p className="text-sm text-muted-foreground truncate">
                @{user.username}
              </p>
            )}
            {showBio && user.bio && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {user.bio}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
