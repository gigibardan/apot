import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { CategoryCard } from "@/components/features/forum/CategoryCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { MessageSquare, TrendingUp } from "lucide-react";
import { getForumCategories, getRecentPosts } from "@/lib/supabase/queries/forum";
import { PostCard } from "@/components/features/forum/PostCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForumHomePage() {
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: getForumCategories,
  });

  const { data: recentPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['forum-recent-posts'],
    queryFn: () => getRecentPosts(5),
  });

  if (categoriesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <SEO
        title="Forum Comunitate"
        description="Discută cu alți călători, cere recomandări și împărtășește experiențele tale de călătorie."
        canonical="/forum"
      />

      {/* Hero Section */}
      <Section className="bg-gradient-to-b from-primary/5 to-background">
        <Container>
          <div className="text-center max-w-2xl mx-auto py-12">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Forum Comunitate</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Discută cu alți călători pasionați, cere recomandări și împărtășește experiențele tale.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="#categories">Explorează Categoriile</a>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Container className="py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Categories */}
          <div className="lg:col-span-2 space-y-8">
            <div id="categories">
              <h2 className="text-2xl font-bold mb-6">Categorii</h2>
              <div className="grid gap-4">
                {categories?.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Recent Posts */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Discuții Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <LoadingSpinner />
                ) : recentPosts && recentPosts.length > 0 ? (
                  <div className="space-y-3">
                    {recentPosts.map((post) => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        categorySlug={post.category?.slug || ''} 
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nu există discuții recente
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Statistici Comunitate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categorii:</span>
                  <span className="font-semibold">{categories?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Discuții:</span>
                  <span className="font-semibold">
                    {categories?.reduce((sum, cat) => sum + cat.posts_count, 0) || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
}
