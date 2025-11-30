import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile, getUserStats } from "@/lib/supabase/queries/social";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FollowButton } from "@/components/features/social/FollowButton";
import { FollowStats } from "@/components/features/social/FollowStats";
import { BadgeDisplay } from "@/components/features/social/BadgeDisplay";
import { PointsDisplay } from "@/components/features/social/PointsDisplay";
import { User, MapPin, Globe, Twitter, Instagram, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { SEO } from "@/components/seo/SEO";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: () => getUserProfile(username!),
    enabled: !!username,
  });

  const { data: stats } = useQuery({
    queryKey: ["userStats", profile?.id],
    queryFn: () => getUserStats(profile!.id),
    enabled: !!profile?.id,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">User not found</h1>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <>
      <SEO
        title={`${profile.full_name} (@${profile.username})`}
        description={profile.bio || `View ${profile.full_name}'s profile on ExplorăLumea`}
      />

      <div className="container py-8">
        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                  <p className="text-muted-foreground">@{profile.username}</p>
                </div>
                {!isOwnProfile && currentUser && (
                  <FollowButton userId={profile.id} />
                )}
              </div>

              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {profile.twitter_handle && (
                  <a
                    href={`https://twitter.com/${profile.twitter_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Twitter className="h-4 w-4" />
                    @{profile.twitter_handle}
                  </a>
                )}
                {profile.instagram_handle && (
                  <a
                    href={`https://instagram.com/${profile.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Instagram className="h-4 w-4" />
                    @{profile.instagram_handle}
                  </a>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                </div>
              </div>

              <FollowStats userId={profile.id} />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats?.favoritesCount || 0}</p>
              <p className="text-sm text-muted-foreground">Favorites</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats?.reviewsCount || 0}</p>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats?.postsCount || 0}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{profile.points.level}</p>
              <p className="text-sm text-muted-foreground">Level</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{profile.badges.length}</p>
              <p className="text-sm text-muted-foreground">Badges</p>
            </div>
          </div>
        </Card>

        {/* Points & Badges */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <PointsDisplay points={profile.points} />
          <Card className="p-4">
            <h2 className="font-semibold mb-3">Badges</h2>
            <BadgeDisplay badges={profile.badges} />
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="activity">
          <TabsList>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <Card className="p-6">
              <p className="text-muted-foreground">Activity feed coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card className="p-6">
              <p className="text-muted-foreground">Favorites coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="p-6">
              <p className="text-muted-foreground">Reviews coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card className="p-6">
              <p className="text-muted-foreground">Forum posts coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
