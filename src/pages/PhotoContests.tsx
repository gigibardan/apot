import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getActiveContest, getVotingContests, getPastContests, getContestSubmissions } from "@/lib/supabase/queries/contests";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/seo/SEO";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ContestCountdown } from "@/components/features/contests/ContestCountdown";
import { Camera, Trophy, Upload, Vote } from "lucide-react";

export default function PhotoContests() {
  const { data: activeContest, isLoading: loadingActive } = useQuery({
    queryKey: ["activeContest"],
    queryFn: getActiveContest,
  });

  const { data: votingContests, isLoading: loadingVoting } = useQuery({
    queryKey: ["votingContests"],
    queryFn: getVotingContests,
  });

  const { data: pastContests, isLoading: loadingPast } = useQuery({
    queryKey: ["pastContests"],
    queryFn: () => getPastContests(6),
  });

  const { data: activeSubmissions } = useQuery({
    queryKey: ["activeContestSubmissions", activeContest?.id],
    queryFn: () => getContestSubmissions(activeContest!.id, false, 8),
    enabled: !!activeContest,
  });

  if (loadingActive || loadingVoting || loadingPast) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <SEO
        title="Concursuri Foto"
        description="Participă la concursurile noastre foto și arată-ți talentul fotografic"
      />

      <div className="min-h-screen">
        {/* Hero - Active Contest */}
        {activeContest && (
          <div className="relative">
            <div className="aspect-[21/9] md:aspect-[21/9] w-full overflow-hidden">
              <img
                src={activeContest.cover_image || "/placeholder.svg"}
                alt={activeContest.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
            <div className="absolute inset-0 flex items-end">
              <div className="container pb-8 md:pb-12 text-white">
                <Badge className="mb-4 bg-green-500/90">
                  <Upload className="mr-1 h-3 w-3" />Activ
                </Badge>
                <h1 className="text-3xl md:text-5xl font-bold mb-2">{activeContest.title}</h1>
                <p className="text-lg md:text-xl text-white/80 mb-4">{activeContest.theme}</p>
                <div className="mb-6">
                  <ContestCountdown 
                    targetDate={activeContest.end_date} 
                    label="Înscrierile se închid în:"
                  />
                </div>
                <Link to={`/contests/${activeContest.slug}`}>
                  <Button size="lg" className="text-lg px-8">
                    <Camera className="mr-2 h-5 w-5" />
                    Participă Acum
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="container py-8 md:py-12 space-y-12">
          {/* Submissions Gallery Preview */}
          {activeSubmissions && activeSubmissions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Fotografii Înscrise</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {activeSubmissions.slice(0, 8).map((submission: any) => (
                  <Link key={submission.id} to={`/contests/${activeContest?.slug}`}>
                    <div className="aspect-square overflow-hidden rounded-lg group">
                      <img
                        src={submission.image_url}
                        alt={submission.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Voting Contests */}
          {votingContests && votingContests.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Votează Acum</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {votingContests.map((contest) => (
                  <Card key={contest.id} className="overflow-hidden">
                    {contest.cover_image && (
                      <div className="aspect-video overflow-hidden">
                        <img src={contest.cover_image} alt={contest.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{contest.title}</CardTitle>
                        <Badge variant="secondary"><Vote className="mr-1 h-3 w-3" />Voting</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ContestCountdown targetDate={contest.voting_end_date!} label="Votarea se încheie în:" compact />
                    </CardContent>
                    <CardFooter>
                      <Link to={`/contests/${contest.slug}`} className="w-full">
                        <Button variant="outline" className="w-full"><Vote className="mr-2 h-4 w-4" />Votează</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Past Contests */}
          {pastContests && pastContests.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Concursuri Anterioare</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastContests.map((contest) => (
                  <Link key={contest.id} to={`/contests/${contest.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      {contest.cover_image && (
                        <div className="aspect-video overflow-hidden">
                          <img src={contest.cover_image} alt={contest.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg">{contest.title}</CardTitle>
                      </CardHeader>
                      <CardFooter>
                        <Badge variant="secondary"><Trophy className="mr-1 h-3 w-3" />Încheiat</Badge>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No Contests */}
          {!activeContest && (!votingContests || votingContests.length === 0) && (!pastContests || pastContests.length === 0) && (
            <Card className="p-12 text-center">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Niciun concurs momentan</h3>
              <p className="text-muted-foreground">Revino curând pentru concursuri noi!</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
