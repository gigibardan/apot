import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContestBySlug, getContestSubmissions, getUserVote, getUserSubmissionStatus } from "@/lib/supabase/queries/contests";
import { submitToContest, voteForSubmission, removeVote } from "@/lib/supabase/mutations/contests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUpload from "@/components/admin/ImageUpload";
import { SEO } from "@/components/seo/SEO";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ContestCountdown } from "@/components/features/contests/ContestCountdown";
import { Camera, Upload, Vote, Trophy, Clock, CheckCircle, XCircle, LogIn } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";

interface SubmissionFormData {
  title: string;
  description?: string;
}

export default function ContestSingle() {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SubmissionFormData>();

  const { data: contest, isLoading: loadingContest } = useQuery({
    queryKey: ["contest", slug],
    queryFn: () => getContestBySlug(slug!),
  });

  const { data: submissions, isLoading: loadingSubmissions } = useQuery({
    queryKey: ["contestSubmissions", contest?.id, isAdmin],
    queryFn: () => getContestSubmissions(contest!.id, isAdmin),
    enabled: !!contest,
  });

  const { data: userVote } = useQuery({
    queryKey: ["userVote", contest?.id],
    queryFn: () => getUserVote(contest!.id),
    enabled: !!contest && !!user,
  });

  const { data: userSubmission } = useQuery({
    queryKey: ["userSubmission", contest?.id],
    queryFn: () => getUserSubmissionStatus(contest!.id),
    enabled: !!contest && !!user,
  });

  const submitMutation = useMutation({
    mutationFn: (data: SubmissionFormData) => submitToContest({
      contest_id: contest!.id,
      image_url: imageUrl,
      title: data.title,
      description: data.description,
      accepted_terms: acceptedTerms,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contestSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["userSubmission"] });
      toast.success("Fotografia a fost trimisă! Va fi verificată de echipa noastră.");
      setSubmitDialogOpen(false);
      reset();
      setImageUrl("");
      setAcceptedTerms(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Eroare la trimitere");
    },
  });

  const voteMutation = useMutation({
    mutationFn: (submissionId: string) => {
      if (userVote === submissionId) return removeVote(contest!.id);
      return voteForSubmission(contest!.id, submissionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contestSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["userVote"] });
      toast.success("Vot înregistrat!");
    },
    onError: () => toast.error("Eroare la vot"),
  });

  const onSubmit = (data: SubmissionFormData) => {
    if (!imageUrl) { toast.error("Încarcă o fotografie"); return; }
    if (!acceptedTerms) { toast.error("Trebuie să accepți termenii și condițiile"); return; }
    submitMutation.mutate(data);
  };

  if (loadingContest) return <LoadingSpinner />;
  if (!contest) return (
    <div className="container py-12 text-center">
      <h2 className="text-2xl font-bold mb-4">Concursul nu a fost găsit</h2>
      <Link to="/contests"><Button>Înapoi la Concursuri</Button></Link>
    </div>
  );

  const isActive = contest.status === "active";
  const isVoting = contest.status === "voting";
  const isEnded = contest.status === "ended";

  return (
    <>
      <SEO title={contest.title} description={contest.description} ogImage={contest.cover_image} />

      {/* Hero */}
      <div className="relative">
        {contest.cover_image && (
          <div className="aspect-[21/9] md:aspect-[21/9] w-full overflow-hidden">
            <img src={contest.cover_image} alt={contest.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        )}
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-8 md:pb-12 text-white">
            <Badge className={isActive ? "bg-green-500/90 mb-4" : isVoting ? "bg-blue-500/90 mb-4" : "bg-gray-500/90 mb-4"}>
              {isActive && <><Upload className="mr-1 h-3 w-3" />Activ</>}
              {isVoting && <><Vote className="mr-1 h-3 w-3" />Voting</>}
              {isEnded && <><Trophy className="mr-1 h-3 w-3" />Încheiat</>}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{contest.title}</h1>
            <p className="text-lg text-white/80 mb-4">{contest.theme}</p>
            {isActive && <ContestCountdown targetDate={contest.end_date} label="Înscrierile se închid în:" />}
            {isVoting && contest.voting_end_date && <ContestCountdown targetDate={contest.voting_end_date} label="Votarea se încheie în:" />}
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* User Submission Status */}
        {user && userSubmission && (
          <Card className={userSubmission.status === "approved" ? "border-green-500" : userSubmission.status === "rejected" ? "border-red-500" : "border-yellow-500"}>
            <CardContent className="p-4 flex items-center gap-4">
              {userSubmission.status === "pending" && <><Clock className="h-6 w-6 text-yellow-500" /><div><p className="font-semibold">Fotografia ta este în curs de verificare</p><p className="text-sm text-muted-foreground">Vei fi notificat după aprobare.</p></div></>}
              {userSubmission.status === "approved" && <><CheckCircle className="h-6 w-6 text-green-500" /><div><p className="font-semibold">Fotografia ta a fost aprobată!</p><p className="text-sm text-muted-foreground">{userSubmission.votes_count || 0} voturi</p></div></>}
              {userSubmission.status === "rejected" && <><XCircle className="h-6 w-6 text-red-500" /><div><p className="font-semibold">Fotografia ta a fost respinsă</p><p className="text-sm text-muted-foreground">{userSubmission.rejection_reason}</p></div></>}
            </CardContent>
          </Card>
        )}

        {/* Submit Section */}
        {isActive && !userSubmission && (
          <Card className="p-6">
            {!user ? (
              <div className="text-center py-4">
                <p className="mb-4">Autentifică-te pentru a participa</p>
                <Link to="/auth/login"><Button><LogIn className="mr-2 h-4 w-4" />Autentificare</Button></Link>
              </div>
            ) : (
              <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full md:w-auto"><Camera className="mr-2 h-5 w-5" />Participă cu Fotografia Ta</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Trimite Fotografia</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label>Titlu *</Label>
                      <Input {...register("title", { required: "Titlul este obligatoriu", maxLength: { value: 100, message: "Max 100 caractere" } })} placeholder="Titlul fotografiei" />
                      {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
                    </div>
                    <div>
                      <Label>Descriere</Label>
                      <Textarea {...register("description", { maxLength: { value: 500, message: "Max 500 caractere" } })} placeholder="Descrie fotografia..." rows={3} />
                    </div>
                    <div>
                      <Label>Fotografie *</Label>
                      <ImageUpload value={imageUrl} onChange={setImageUrl} bucket="blog-images" />
                    </div>
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(c) => setAcceptedTerms(c as boolean)} />
                        <label htmlFor="terms" className="text-sm leading-relaxed">
                          Declar că sunt autorul fotografiei, dețin toate drepturile, nu am folosit AI sau materiale protejate, și accept <Link to="/contests/terms" target="_blank" className="text-primary hover:underline">Termenii și Condițiile</Link>.
                        </label>
                      </div>
                    </div>
                    <Button type="submit" disabled={submitMutation.isPending || !acceptedTerms} className="w-full">
                      <Upload className="mr-2 h-4 w-4" />Trimite Fotografia
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </Card>
        )}

        {/* Submissions Grid */}
        {loadingSubmissions ? <LoadingSpinner /> : !submissions?.length ? (
          <Card className="p-12 text-center"><Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Nicio fotografie încă</p></Card>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">{isVoting ? "Votează Fotografia Preferată" : "Fotografii"} ({submissions.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map((sub: any) => (
                <Card key={sub.id} className={sub.winner_rank ? sub.winner_rank === 1 ? "border-yellow-500 border-2" : sub.winner_rank === 2 ? "border-gray-400 border-2" : "border-amber-700 border-2" : ""}>
                  <div className="aspect-square overflow-hidden relative">
                    <img src={sub.image_url} alt={sub.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    {sub.winner_rank && (
                      <div className="absolute top-2 left-2">
                        <Badge className={sub.winner_rank === 1 ? "bg-yellow-500" : sub.winner_rank === 2 ? "bg-gray-400" : "bg-amber-700"}>
                          {sub.winner_rank === 1 ? "🥇 1st" : sub.winner_rank === 2 ? "🥈 2nd" : "🥉 3rd"}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{sub.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>de {sub.user?.full_name}</span>
                      <span className="flex items-center gap-1"><Vote className="h-3 w-3" />{sub.votes_count || 0}</span>
                    </div>
                  </CardContent>
                  {isVoting && user && (
                    <CardFooter className="p-4 pt-0">
                      <Button variant={userVote === sub.id ? "default" : "outline"} size="sm" onClick={() => voteMutation.mutate(sub.id)} disabled={voteMutation.isPending} className="w-full">
                        <Vote className="mr-2 h-4 w-4" />{userVote === sub.id ? "Votul Tău" : "Votează"}
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
