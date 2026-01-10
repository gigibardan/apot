import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getActiveContest, getVotingContests, getPastContests } from "@/lib/supabase/queries/contests";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/seo/SEO";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Camera, Trophy, Upload, Vote } from "lucide-react";
import { format } from "date-fns";

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

  if (loadingActive || loadingVoting || loadingPast) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <SEO
        title="Photo Contests"
        description="Join our monthly photo contests and showcase your travel photography"
      />

      <div className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <Camera className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Photo Contests</h1>
            <p className="text-muted-foreground">
              Showcase your travel photography and win prizes
            </p>
          </div>
        </div>

        {/* Active Contest */}
        {activeContest && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Current Contest</h2>
            <Card className="overflow-hidden border-primary">
              {activeContest.cover_image && (
                <div className="aspect-[21/9] overflow-hidden">
                  <img
                    src={activeContest.cover_image}
                    alt={activeContest.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{activeContest.title}</CardTitle>
                    <p className="text-muted-foreground">{activeContest.theme}</p>
                  </div>
                  <Badge variant="secondary">
                    <Upload className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{activeContest.description}</p>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>Deadline: {format(new Date(activeContest.end_date), "MMM dd, yyyy")}</span>
                  <span>Theme: {activeContest.theme}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link to={`/contests/${activeContest.slug}`}>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Photo
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Voting Contests */}
        {votingContests && votingContests.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Vote Now</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {votingContests.map((contest) => (
                <Card key={contest.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>{contest.title}</CardTitle>
                      <Badge variant="default">
                        <Vote className="mr-1 h-3 w-3" />
                        Voting
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      Voting ends: {format(new Date(contest.voting_end_date!), "MMM dd, yyyy")}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link to={`/contests/${contest.slug}`}>
                      <Button variant="outline">
                        <Vote className="mr-2 h-4 w-4" />
                        Cast Your Vote
                      </Button>
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
            <h2 className="text-2xl font-semibold mb-4">Past Winners</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pastContests.map((contest) => (
                <Link key={contest.id} to={`/contests/${contest.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow">
                    {contest.cover_image && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={contest.cover_image}
                          alt={contest.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{contest.title}</CardTitle>
                    </CardHeader>
                    <CardFooter>
                      <Badge variant="secondary">
                        <Trophy className="mr-1 h-3 w-3" />
                        Ended
                      </Badge>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!activeContest && (!votingContests || votingContests.length === 0) && (!pastContests || pastContests.length === 0) && (
          <Card className="p-12 text-center">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No contests yet</h3>
            <p className="text-muted-foreground">Check back soon for upcoming contests!</p>
          </Card>
        )}
      </div>
    </>
  );
}
