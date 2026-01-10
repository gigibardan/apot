import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { CategoryCard } from "@/components/features/forum/CategoryCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, Users, Hash } from "lucide-react";
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
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <SEO
        title="Forum Comunitate"
        description="Discută cu alți călători, cere recomandări și împărtășește experiențele tale de călătorie."
        canonical="/forum"
      />

      {/* =============================================
        1. HERO SECTION (Dark Style - Consistență APOT)
        ============================================= */}
      <div className="bg-[#0F172A] text-white border-b border-white/10">
        <Container className="py-8 md:py-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
              <Users className="h-3.5 w-3.5 mr-2" />
              Comunitatea APOT
            </Badge>
            <h1 className="text-4xl md:text-[2.75rem] font-bold tracking-tight leading-tight">
              Forum <span className="text-primary">Comunitate</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              Discută cu alți călători pasionați, cere recomandări și împărtășește experiențele tale din întreaga lume.
            </p>
            <div className="pt-4">
              <Button size="lg" className="rounded-full px-8 font-bold" asChild>
                <a href="#categories">Explorează Categoriile</a>
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* =============================================
        2. CONTENT AREA (Responsive Grid)
        ============================================= */}
      <Container className="py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content - Categories */}
          <div className="lg:col-span-2 space-y-8">
            <div id="categories">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <h2 className="text-2xl font-bold dark:text-white">Categorii Discuții</h2>
              </div>
              <div className="grid gap-4">
                {categories?.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Recent Posts & Stats */}
          <div className="space-y-6">
            {/* Discuții Recente */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Discuții Recente
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {postsLoading ? (
                  <div className="py-8"><LoadingSpinner /></div>
                ) : recentPosts && recentPosts.length > 0 ? (
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        categorySlug={post.category?.slug || ''} 
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nu există discuții recente
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Statistici Card */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" />
                  Statistici
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <span className="text-sm text-muted-foreground">Categorii:</span>
                  <span className="font-bold dark:text-white">{categories?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <span className="text-sm text-muted-foreground">Total Discuții:</span>
                  <span className="font-bold dark:text-white">
                    {categories?.reduce((sum, cat) => sum + cat.posts_count, 0) || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </Container>
    </div>
  );
}