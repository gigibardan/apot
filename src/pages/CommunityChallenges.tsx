import { useQuery } from "@tanstack/react-query";
import { getActiveChallenges, getUserChallengeProgress } from "@/lib/supabase/queries/challenges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SEO } from "@/components/seo/SEO";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Trophy, Target, Star, Award } from "lucide-react";

export default function CommunityChallenges() {
  const { data: challenges, isLoading: loadingChallenges } = useQuery({
    queryKey: ["activeChallenges"],
    queryFn: getActiveChallenges,
  });

  const { data: userProgress, isLoading: loadingProgress } = useQuery<any[]>({
    queryKey: ["userChallengeProgress"],
    queryFn: async () => {
      const result = await getUserChallengeProgress();
      return result || [];
    },
  });

  if (loadingChallenges || loadingProgress) {
    return <LoadingSpinner />;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "visit_count":
        return <Target className="h-5 w-5" />;
      case "review_count":
        return <Star className="h-5 w-5" />;
      default:
        return <Trophy className="h-5 w-5" />;
    }
  };

  const getProgress = (challengeId: string) => {
    return userProgress?.find((p: any) => p.challenge_id === challengeId);
  };

  return (
    <>
      <SEO
        title="Community Challenges"
        description="Complete challenges to earn badges and rewards"
      />

      <div className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Community Challenges</h1>
            <p className="text-muted-foreground">
              Complete challenges to earn badges and points
            </p>
          </div>
        </div>

        {!challenges || challenges.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No active challenges</h3>
            <p className="text-muted-foreground">Check back soon for new challenges!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge: any) => {
              const progress = getProgress(challenge.id);
              const percentage = progress
                ? Math.min((progress.current_value / challenge.target_value) * 100, 100)
                : 0;

              return (
                <Card key={challenge.id} className={progress?.completed ? "border-primary" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 text-primary">
                        {getIcon(challenge.challenge_type)}
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      </div>
                      {progress?.completed && (
                        <Badge variant="secondary">
                          <Award className="mr-1 h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-semibold">
                          {progress?.current_value || 0} / {challenge.target_value}
                        </span>
                      </div>
                      <Progress value={percentage} />
                    </div>

                    <div className="pt-4 border-t">
                      <div className="text-sm font-medium mb-2">Reward:</div>
                      <div className="flex items-center gap-2">
                        {challenge.reward_type === "badge" || challenge.reward_type === "both" ? (
                          <Badge variant="outline">
                            <Trophy className="mr-1 h-3 w-3" />
                            {challenge.reward_badge_name}
                          </Badge>
                        ) : null}
                        {challenge.reward_type === "points" || challenge.reward_type === "both" ? (
                          <Badge variant="outline">
                            <Star className="mr-1 h-3 w-3" />
                            {challenge.reward_points} points
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
