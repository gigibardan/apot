import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContestBySlug, getContestSubmissions, getUserVote, hasUserSubmitted } from "@/lib/supabase/queries/contests";
import { submitToContest, voteForSubmission, removeVote } from "@/lib/supabase/mutations/contests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/admin/ImageUpload";
import { SEO } from "@/components/seo/SEO";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Camera, Upload, Vote, Trophy, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";

interface SubmissionFormData {
  title: string;
  description?: string;
  image_url: string;
}

export default function ContestSingle() {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SubmissionFormData>();

  const { data: contest, isLoading: loadingContest } = useQuery({
    queryKey: ["contest", slug],
    queryFn: () => getContestBySlug(slug!),
  });

  const { data: submissions, isLoading: loadingSubmissions } = useQuery({
    queryKey: ["contestSubmissions", contest?.id],
    queryFn: () => getContestSubmissions(contest!.id),
    enabled: !!contest,
  });

  const { data: userVote } = useQuery({
    queryKey: ["userVote", contest?.id],
    queryFn: () => getUserVote(contest!.id),
    enabled: !!contest && !!user,
  });

  const { data: userHasSubmitted } = useQuery({
    queryKey: ["hasSubmitted", contest?.id],
    queryFn: () => hasUserSubmitted(contest!.id),
    enabled: !!contest && !!user,
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => submitToContest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contestSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["hasSubmitted"] });
      toast.success("Photo submitted successfully!");
      setSubmitDialogOpen(false);
      reset();
      setImageUrl("");
    },
    onError: () => {
      toast.error("Failed to submit photo");
    },
  });

  const voteMutation = useMutation({
    mutationFn: (submissionId: string) => {
      if (userVote === submissionId) {
        return removeVote(contest!.id);
      }
      return voteForSubmission(contest!.id, submissionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contestSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["userVote"] });
      toast.success("Vote updated!");
    },
    onError: () => {
      toast.error("Failed to vote");
    },
  });

  const onSubmit = (data: SubmissionFormData) => {
    if (!imageUrl) {
      toast.error("Please upload an image");
      return;
    }

    submitMutation.mutate({
      contest_id: contest!.id,
      image_url: imageUrl,
      title: data.title,
      description: data.description,
    });
  };

  if (loadingContest) {
    return <LoadingSpinner />;
  }

  if (!contest) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Contest not found</h2>
        <Link to="/contests">
          <Button>Back to Contests</Button>
        </Link>
      </div>
    );
  }

  const isActive = contest.status === "active";
  const isVoting = contest.status === "voting";
  const isEnded = contest.status === "ended";

  return (
    <>
      <SEO
        title={contest.title}
        description={contest.description}
        ogImage={contest.cover_image}
      />

      <div className="container py-8">
        {/* Contest Header */}
        <div className="mb-8">
          {contest.cover_image && (
            <div className="aspect-[21/9] overflow-hidden rounded-lg mb-6">
              <img
                src={contest.cover_image}
                alt={contest.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{contest.title}</h1>
              <p className="text-xl text-muted-foreground">{contest.theme}</p>
            </div>
            <Badge variant={isActive ? "default" : isVoting ? "secondary" : "outline"}>
              {isActive && <><Upload className="mr-1 h-3 w-3" />Active</>}
              {isVoting && <><Vote className="mr-1 h-3 w-3" />Voting</>}
              {isEnded && <><Trophy className="mr-1 h-3 w-3" />Ended</>}
            </Badge>
          </div>

          <p className="text-lg mb-4">{contest.description}</p>

          <div className="flex flex-wrap gap-6 text-muted-foreground">
            {isActive && (
              <div>
                <strong>Deadline:</strong> {format(new Date(contest.end_date), "MMMM dd, yyyy")}
              </div>
            )}
            {isVoting && contest.voting_end_date && (
              <div>
                <strong>Voting ends:</strong> {format(new Date(contest.voting_end_date), "MMMM dd, yyyy")}
              </div>
            )}
            {contest.prizes_description && (
              <div>
                <strong>Prizes:</strong> {contest.prizes_description}
              </div>
            )}
          </div>

          {/* Submit Button */}
          {isActive && user && !userHasSubmitted && (
            <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-6" size="lg">
                  <Camera className="mr-2 h-5 w-5" />
                  Submit Your Photo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Submit Photo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      {...register("title", { required: "Title is required" })}
                      placeholder="Give your photo a title"
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Tell us about your photo..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Photo *</Label>
                    <ImageUpload
                      value={imageUrl}
                      onChange={setImageUrl}
                      bucket="blog-images"
                    />
                  </div>

                  <Button type="submit" disabled={submitMutation.isPending} className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Photo
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {userHasSubmitted && isActive && (
            <Badge variant="secondary" className="mt-6">
              <Camera className="mr-1 h-3 w-3" />
              You've already submitted
            </Badge>
          )}
        </div>

        {/* Submissions Grid */}
        {loadingSubmissions ? (
          <LoadingSpinner />
        ) : !submissions || submissions.length === 0 ? (
          <Card className="p-12 text-center">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
            <p className="text-muted-foreground">Be the first to submit!</p>
          </Card>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {isVoting ? "Vote for Your Favorite" : "Submissions"} ({submissions.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map((submission: any) => (
                <Card key={submission.id} className={submission.winner_rank ? "border-primary" : ""}>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={submission.image_url}
                      alt={submission.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <CardContent className="p-4">
                    {submission.winner_rank && (
                      <Badge variant="default" className="mb-2">
                        <Trophy className="mr-1 h-3 w-3" />
                        {submission.winner_rank === 1 ? "1st Place" : submission.winner_rank === 2 ? "2nd Place" : "3rd Place"}
                      </Badge>
                    )}
                    <h3 className="font-semibold mb-1">{submission.title}</h3>
                    {submission.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {submission.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>by {submission.user?.full_name}</span>
                      <div className="flex items-center gap-1">
                        <Vote className="h-4 w-4" />
                        {submission.votes_count || 0}
                      </div>
                    </div>
                  </CardContent>
                  {isVoting && user && (
                    <CardFooter className="p-4 pt-0">
                      <Button
                        variant={userVote === submission.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => voteMutation.mutate(submission.id)}
                        disabled={voteMutation.isPending}
                        className="w-full"
                      >
                        <Vote className="mr-2 h-4 w-4" />
                        {userVote === submission.id ? "Remove Vote" : "Vote"}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
