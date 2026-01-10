import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PostCard } from "@/components/features/forum/PostCard";
import { PostForm } from "@/components/features/forum/PostForm";
import { ChevronLeft, Plus, MessageSquare, Hash } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getCategoryBySlug, getPostsByCategory } from "@/lib/supabase/queries/forum";
import { createPost } from "@/lib/supabase/mutations/forum";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForumCategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNewPost, setShowNewPost] = useState(false);
  const [sortBy, setSortBy] = useState<'last_activity' | 'created' | 'popular'>('last_activity');
  const [page, setPage] = useState(1);
  const POSTS_PER_PAGE = 20;

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['forum-category', categorySlug],
    queryFn: () => getCategoryBySlug(categorySlug!),
    enabled: !!categorySlug,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['forum-posts', category?.id, sortBy, page],
    queryFn: () => getPostsByCategory(category!.id, {
      limit: POSTS_PER_PAGE,
      offset: (page - 1) * POSTS_PER_PAGE,
      sortBy,
    }),
    enabled: !!category,
  });

  const createPostMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      createPost({ ...data, category_id: category!.id }),
    onSuccess: (post) => {
      toast.success("Discuția a fost creată cu succes!");
      queryClient.invalidateQueries({ queryKey: ['forum-posts', category!.id] });
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      setShowNewPost(false);
      navigate(`/forum/${categorySlug}/${post.slug}`);
    },
    onError: () => {
      toast.error("A apărut o eroare. Te rugăm să încerci din nou.");
    },
  });

  if (categoryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!category) {
    return (
      <Container className="py-12">
        <Alert variant="destructive">
          <AlertDescription>Categoria nu a fost găsită.</AlertDescription>
        </Alert>
      </Container>
    );
  }

  const totalPages = Math.ceil((postsData?.count || 0) / POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <SEO
        title={category.name}
        description={category.description || `Discuții în categoria ${category.name}`}
        canonical={`/forum/${categorySlug}`}
      />

      {/* =============================================
        1. COMPACT HERO SECTION (Dark Style)
        ============================================= */}
      <div className="bg-[#0F172A] text-white border-b border-white/10">
        <Container className="py-8 md:py-10">
          {/* Breadcrumb discret */}
          <Link 
            to="/forum" 
            className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-primary transition-colors mb-4 uppercase tracking-wider"
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            Înapoi la Forum
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1 bg-primary rounded-full" />
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {category.name}
                </h1>
              </div>
              
              {category.description && (
                <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
                  {category.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-primary/70" />
                  {postsData?.count || 0} {postsData?.count === 1 ? 'discuție' : 'discuții'}
                </span>
              </div>
            </div>

            {user && (
              <Button 
                onClick={() => setShowNewPost(!showNewPost)}
                className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Discuție Nouă
              </Button>
            )}
          </div>
        </Container>
      </div>

      {/* =============================================
        2. CONTENT AREA
        ============================================= */}
      <Container className="py-10">
        {!user && (
          <Alert className="mb-8 border-primary/20 bg-primary/5 dark:bg-primary/10">
            <MessageSquare className="h-4 w-4 text-primary" />
            <AlertDescription className="dark:text-slate-300">
              <Link to="/auth/login" className="font-bold text-primary hover:underline">
                Autentifică-te
              </Link>{" "}
              pentru a crea discuții noi și a participa la conversații în comunitatea APOT.
            </AlertDescription>
          </Alert>
        )}

        {showNewPost && user && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
            <PostForm
              categoryId={category.id}
              onSubmit={(data) => createPostMutation.mutate(data)}
              onCancel={() => setShowNewPost(false)}
            />
          </div>
        )}

        {/* Filters bar stilizată */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Sortare</span>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px] h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_activity">Activitate Recentă</SelectItem>
                <SelectItem value="created">Cele Mai Noi</SelectItem>
                <SelectItem value="popular">Cele Mai Populare</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Posts List */}
        {postsLoading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : postsData && postsData.posts.length > 0 ? (
          <div className="space-y-4">
            <div className="grid gap-4 mb-8">
              {postsData.posts.map((post) => (
                <PostCard key={post.id} post={post} categorySlug={categorySlug!} />
              ))}
            </div>

            {/* Pagination stilizată */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 pt-8 border-t border-slate-100 dark:border-slate-900">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    Anteriorul
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "ghost"}
                        size="sm"
                        className={`w-8 h-8 p-0 rounded-md ${p === page ? 'shadow-md shadow-primary/20' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    Următorul
                  </Button>
                </div>
                <p className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">
                  Pagina {page} din {totalPages}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
            <MessageSquare className="h-12 w-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
            <h3 className="text-lg font-bold dark:text-white">Nu există discuții încă</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">
              Fii primul care deschide o conversație în categoria {category.name}!
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}