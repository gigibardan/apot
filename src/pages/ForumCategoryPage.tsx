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
import { ChevronLeft, Plus, MessageSquare } from "lucide-react";
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
    return <LoadingSpinner />;
  }

  if (!category) {
    return (
      <Container className="py-12">
        <Alert>
          <AlertDescription>Categoria nu a fost găsită.</AlertDescription>
        </Alert>
      </Container>
    );
  }

  const totalPages = Math.ceil((postsData?.count || 0) / POSTS_PER_PAGE);

  return (
    <>
      <SEO
        title={category.name}
        description={category.description || `Discuții în categoria ${category.name}`}
        canonical={`/forum/${categorySlug}`}
      />

      <Section className="bg-gradient-to-b from-primary/5 to-background">
        <Container>
          <div className="py-8">
            <Link to="/forum" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Înapoi la Forum
            </Link>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
                {category.description && (
                  <p className="text-muted-foreground">{category.description}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {postsData?.count || 0} {postsData?.count === 1 ? 'discuție' : 'discuții'}
                </p>
              </div>
              {user && (
                <Button onClick={() => setShowNewPost(!showNewPost)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Discuție Nouă
                </Button>
              )}
            </div>
          </div>
        </Container>
      </Section>

      <Container className="py-8">
        {!user && (
          <Alert className="mb-6">
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              <Link to="/auth/login" className="font-semibold underline">
                Autentifică-te
              </Link>{" "}
              pentru a crea discuții noi și a participa la conversații.
            </AlertDescription>
          </Alert>
        )}

        {showNewPost && user && (
          <div className="mb-8">
            <PostForm
              categoryId={category.id}
              onSubmit={(data) => createPostMutation.mutate(data)}
              onCancel={() => setShowNewPost(false)}
            />
          </div>
        )}

        {/* Sort and Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sortare:</span>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[200px]">
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
          <LoadingSpinner />
        ) : postsData && postsData.posts.length > 0 ? (
          <>
            <div className="space-y-4 mb-8">
              {postsData.posts.map((post) => (
                <PostCard key={post.id} post={post} categorySlug={categorySlug!} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Anteriorul
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Pagina {page} din {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Următorul
                </Button>
              </div>
            )}
          </>
        ) : (
          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              Nu există discuții în această categorie încă. Fii primul care creează o discuție!
            </AlertDescription>
          </Alert>
        )}
      </Container>
    </>
  );
}
