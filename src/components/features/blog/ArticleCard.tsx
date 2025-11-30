import { Link } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BlogArticle } from "@/types/database.types";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface ArticleCardProps {
  article: BlogArticle;
  variant?: "default" | "horizontal";
  className?: string;
}

/**
 * ArticleCard Component
 * Display blog articles with preview
 */
export function ArticleCard({
  article,
  variant = "default",
  className,
}: ArticleCardProps) {
  const formattedDate = article.published_at
    ? format(new Date(article.published_at), "d MMMM yyyy", { locale: ro })
    : "";

  const categoryColors: Record<string, string> = {
    călătorii: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    cultură: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    istorie: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    natură: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    gastronomie: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    aventură: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  };

  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group block h-full"
      aria-label={`Citește ${article.title}`}
    >
      <Card
        className={cn(
          "h-full overflow-hidden transition-all duration-300",
          "hover:shadow-xl hover:-translate-y-1",
          "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
          variant === "horizontal" && "flex flex-row",
          className
        )}
      >
        {/* Image */}
        <div
          className={cn(
            "relative overflow-hidden bg-muted",
            variant === "horizontal"
              ? "w-48 flex-shrink-0"
              : "aspect-[16/9]"
          )}
        >
          {article.featured_image ? (
            <img
              src={article.featured_image}
              alt={article.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <span className="text-4xl" aria-hidden="true">📝</span>
            </div>
          )}

          {/* Category Badge */}
          {article.category && (
            <Badge
              className={cn(
                "absolute top-3 left-3",
                categoryColors[article.category] || "bg-secondary"
              )}
            >
              {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-5 space-y-3 flex flex-col justify-between flex-1">
          <div className="space-y-3">
            {/* Title */}
            <h3 className="text-xl font-display font-bold tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            {article.reading_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{article.reading_time} min citire</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
