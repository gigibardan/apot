import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/features/objectives/Breadcrumbs";
import { BlogSidebar } from "@/components/features/blog/BlogSidebar";
import { ArticleCard } from "@/components/features/blog/ArticleCard";
import { TableOfContents } from "@/components/features/blog/TableOfContents";
import { ReadingProgress } from "@/components/shared/ReadingProgress";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  getBlogArticleBySlug,
  incrementArticleViews,
  getRelatedArticles,
} from "@/lib/supabase/queries/blog";
import { calculateReadingTime, formatReadingTime } from "@/lib/utils/reading-time";
import { generateArticleSchema, generateBreadcrumbSchema } from "@/lib/utils/structured-data";
import type { BlogArticle } from "@/types/database.types";
import { Calendar, Clock, Eye } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { useTranslatedBlogArticle } from "@/hooks/useTranslatedContent";

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const [articleData, setArticleData] = useState<BlogArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get translated content
  const { content: article, isLoading: translationLoading } = useTranslatedBlogArticle(articleData);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const data = await getBlogArticleBySlug(slug);
        setArticleData(data);

        // Increment views
        incrementArticleViews(data.id).catch(console.error);

        // Fetch related articles
        const related = await getRelatedArticles(data.id, 3);
        setRelatedArticles(related);
      } catch (err: any) {
        if (err.message?.includes("No rows")) {
          setNotFound(true);
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  // Generate breadcrumbs
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [{ label: "Blog", href: "/blog" }];

    if (article?.category) {
      items.push({
        label: article.category.charAt(0).toUpperCase() + article.category.slice(1),
        href: `/blog?category=${article.category}`,
      });
    }

    if (article) {
      const title = article.title.length > 40 ? `${article.title.slice(0, 40)}...` : article.title;
      items.push({ label: title });
    }

    return items;
  };

  // Sanitize and process HTML content
  const processedContent = useMemo(() => {
    if (!article?.content) return null;

    // Sanitize HTML
    const sanitized = DOMPurify.sanitize(article.content, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "h2",
        "h3",
        "h4",
        "ul",
        "ol",
        "li",
        "a",
        "blockquote",
        "img",
        "figure",
        "figcaption",
        "iframe",
        "code",
        "pre",
      ],
      ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "class", "width", "height"],
    });

    // Add IDs to headings for TOC
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, "text/html");
    const headings = doc.querySelectorAll("h2, h3");

    headings.forEach((heading) => {
      const text = heading.textContent || "";
      const id = text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      heading.setAttribute("id", id);
    });

    return doc.body.innerHTML;
  }, [article?.content]);

  // Calculate reading time
  const readingTime = article?.reading_time || (article?.content ? calculateReadingTime(article.content) : 0);

  // Loading state
  if (loading || translationLoading) {
    return (
      <>
        <SEO title="Se încarcă..." />
        <Section className="py-8">
          <Container>
            <Skeleton className="h-6 w-2/3 mb-6" />
            <Skeleton className="h-[60vh] w-full mb-8" />
            <div className="grid lg:grid-cols-[1fr_350px] gap-8">
              <div className="space-y-8">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-60 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-60 w-full" />
              </div>
            </div>
          </Container>
        </Section>
      </>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <>
        <SEO title="Articol Negăsit" noindex />
        <Section className="py-16">
          <Container>
            <EmptyState
              icon="📝"
              title="Articolul nu a fost găsit"
              description="Ne pare rău, dar acest articol nu există sau a fost mutat."
              action={{
                label: "Vezi Toate Articolele",
                href: "/blog",
              }}
            />
          </Container>
        </Section>
      </>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <>
        <SEO title="Eroare" noindex />
        <Section className="py-16">
          <Container>
            <EmptyState
              icon="❌"
              title="Nu am putut încărca articolul"
              description="A apărut o eroare la încărcarea datelor. Te rugăm să încerci din nou."
              action={{
                label: "Încearcă din nou",
                onClick: () => window.location.reload(),
              }}
            />
          </Container>
        </Section>
      </>
    );
  }

  const formattedDate = article.published_at
    ? format(new Date(article.published_at), "d MMMM yyyy", { locale: ro })
    : "";

  // Generate structured data
  const breadcrumbs = getBreadcrumbs();
  const breadcrumbItems = breadcrumbs.map((item) => ({
    name: item.label,
    url: item.href,
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      generateArticleSchema(article),
      generateBreadcrumbSchema(breadcrumbItems),
    ],
  };

  // Success state
  return (
    <>
      <SEO
        title={`${article.title} | Blog APOT`}
        description={article.excerpt || article.content?.slice(0, 160) || ""}
        canonical={`/blog/${article.slug}`}
        ogImage={article.featured_image || undefined}
        ogType="article"
        article={{
          publishedTime: article.published_at || article.created_at,
          modifiedTime: article.updated_at,
          tags: article.tags || undefined,
        }}
        structuredData={structuredData}
      />

      <ReadingProgress />
      <ScrollToTop />

      {/* Breadcrumbs */}
      <Section className="py-4 bg-muted/30">
        <Container>
          <Breadcrumbs items={getBreadcrumbs()} />
        </Container>
      </Section>

      {/* Article Header */}
      <Section className="py-8">
        <Container>
          <article className="max-w-4xl mx-auto">
            {/* Category Badge */}
            {article.category && (
              <Link to={`/blog?category=${article.category}`}>
                <Badge className="mb-4">
                  {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                </Badge>
              </Link>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-muted-foreground mb-6">{article.excerpt}</p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
              {readingTime > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatReadingTime(readingTime)}</span>
                  </div>
                </>
              )}
              {article.views_count !== undefined && article.views_count > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{article.views_count.toLocaleString("ro-RO")} vizualizări</span>
                  </div>
                </>
              )}
            </div>

            {/* Featured Image */}
            {article.featured_image && (
              <div className="mb-12 rounded-lg overflow-hidden">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-full aspect-[16/9] object-cover"
                />
              </div>
            )}
          </article>
        </Container>
      </Section>

      {/* Main Content */}
      <Section className="py-8">
        <Container>
          <div className="grid lg:grid-cols-[1fr_350px] gap-12">
            {/* Article Content */}
            <div className="max-w-3xl">
              {/* TOC Mobile */}
              <div className="lg:hidden mb-8">
                {article.content && <TableOfContents content={article.content} variant="mobile" />}
              </div>

              {/* Article Body */}
              {processedContent && (
                <div
                  className="prose prose-slate dark:prose-invert max-w-none prose-lg
                    prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-lg prose-img:shadow-lg
                    prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1"
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                />
              )}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t">
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Etichete</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link key={tag} to={`/blog?tag=${tag}`}>
                        <Badge variant="secondary">{tag}</Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">
                    Articole Similare
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedArticles.map((relArticle) => (
                      <ArticleCard key={relArticle.id} article={relArticle} />
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter CTA */}
              <div className="mt-16">
                <div className="bg-gradient-to-br from-primary via-primary/90 to-accent p-8 md:p-12 rounded-2xl text-center text-primary-foreground">
                  <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
                    Nu rata niciun articol
                  </h3>
                  <p className="text-lg mb-6 opacity-90">
                    Abonează-te la newsletter și primești un ghid gratuit de călătorie
                  </p>
                  <div className="max-w-md mx-auto">
                    <form className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="email"
                        placeholder="Adresa ta de email"
                        className="flex-1 px-4 py-3 rounded-lg bg-background text-foreground border-0 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <button
                        type="submit"
                        className="px-6 py-3 bg-background text-foreground font-semibold rounded-lg hover:bg-background/90 transition-colors"
                      >
                        Abonează-te
                      </button>
                    </form>
                    <p className="text-xs mt-3 opacity-75">
                      Îți respectăm confidențialitatea. Poți anula abonamentul oricând.
                    </p>
                  </div>
                </div>
              </div>

              {/* Comments Placeholder */}
              <div className="mt-16 pt-12 border-t">
                <h3 className="text-2xl font-display font-bold mb-4">Comentarii</h3>
                <p className="text-muted-foreground">
                  Secțiunea de comentarii va fi disponibilă în curând. Între timp, ne poți contacta pe rețelele sociale.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:sticky lg:top-20 self-start">
              <BlogSidebar article={article} />
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
