import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTopContributors,
  getTopExplorers,
  getPointsLeaderboard,
} from "@/lib/supabase/queries/social";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Map, TrendingUp, User } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function Leaderboards() {
  const { data: contributors, isLoading: loadingContributors } = useQuery({
    queryKey: ["topContributors"],
    queryFn: () => getTopContributors("all", 10),
  });

  const { data: explorers, isLoading: loadingExplorers } = useQuery({
    queryKey: ["topExplorers"],
    queryFn: () => getTopExplorers(10),
  });

  const { data: pointsLeaders, isLoading: loadingPoints } = useQuery({
    queryKey: ["pointsLeaderboard"],
    queryFn: () => getPointsLeaderboard(10),
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500">🥇 1st</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400">🥈 2nd</Badge>;
    if (rank === 3) return <Badge className="bg-amber-700">🥉 3rd</Badge>;
    return <span className="text-muted-foreground">#{rank}</span>;
  };

  return (
    <>
      <SEO
        title="Leaderboards"
        description="See the top contributors and explorers in our community"
      />

      <div className="container py-8">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Leaderboards</h1>
            <p className="text-muted-foreground">
              Celebrate our community champions
            </p>
          </div>
        </div>

        <Tabs defaultValue="contributors">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contributors">
              <Star className="mr-2 h-4 w-4" />
              Top Contributors
            </TabsTrigger>
            <TabsTrigger value="explorers">
              <Map className="mr-2 h-4 w-4" />
              Top Explorers
            </TabsTrigger>
            <TabsTrigger value="points">
              <TrendingUp className="mr-2 h-4 w-4" />
              Points Leaders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contributors">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Most Active Contributors
              </h2>
              <p className="text-muted-foreground mb-6">
                Based on reviews, posts, and helpful contributions
              </p>

              {loadingContributors ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4">
                  {contributors?.map((contributor: any, index) => (
                    <div
                      key={contributor.user_id}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="w-12 text-center">
                        {getRankBadge(index + 1)}
                      </div>
                      <Link
                        to={`/user/${contributor.user.username || contributor.user_id}`}
                        className="flex items-center gap-3 flex-1"
                      >
                        <Avatar>
                          <AvatarImage src={contributor.user.avatar_url} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {contributor.user.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{contributor.user.username}
                          </p>
                        </div>
                      </Link>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {contributor.reputation_points}
                        </p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="explorers">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Top Explorers</h2>
              <p className="text-muted-foreground mb-6">
                Users who added the most favorites
              </p>

              {loadingExplorers ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4">
                  {explorers?.map((explorer: any, index) => (
                    <div
                      key={explorer.user.id}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="w-12 text-center">
                        {getRankBadge(index + 1)}
                      </div>
                      <Link
                        to={`/user/${explorer.user.username || explorer.user.id}`}
                        className="flex items-center gap-3 flex-1"
                      >
                        <Avatar>
                          <AvatarImage src={explorer.user.avatar_url} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {explorer.user.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{explorer.user.username}
                          </p>
                        </div>
                      </Link>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{explorer.count}</p>
                        <p className="text-xs text-muted-foreground">
                          favorites
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="points">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Points Leaders</h2>
              <p className="text-muted-foreground mb-6">
                Users with the most points and highest levels
              </p>

              {loadingPoints ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4">
                  {pointsLeaders?.map((leader: any, index) => (
                    <div
                      key={leader.user_id}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="w-12 text-center">
                        {getRankBadge(index + 1)}
                      </div>
                      <Link
                        to={`/user/${leader.user.username || leader.user_id}`}
                        className="flex items-center gap-3 flex-1"
                      >
                        <Avatar>
                          <AvatarImage src={leader.user.avatar_url} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {leader.user.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{leader.user.username} • Level {leader.level}
                          </p>
                        </div>
                      </Link>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {leader.total_points}
                        </p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
