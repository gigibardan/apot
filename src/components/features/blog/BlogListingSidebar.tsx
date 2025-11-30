import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewsletterSignup } from "../newsletter/NewsletterSignup";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { BlogCategory } from "@/types/database.types";

interface CategoryCount {
  category: BlogCategory;
  count: number;
}

interface BlogListingSidebarProps {
  categories: CategoryCount[];
  tags: { tag: string; count: number }[];
  selectedCategory?: BlogCategory | "all";
  onCategoryClick: (category: BlogCategory | "all") => void;
  onTagClick: (tag: string) => void;
}

const CATEGORY_LABELS: Record<BlogCategory, string> = {
  călătorii: "Călătorii",
  cultură: "Cultură",
  istorie: "Istorie",
  natură: "Natură",
  gastronomie: "Gastronomie",
  aventură: "Aventură",
};

export function BlogListingSidebar({
  categories,
  tags,
  selectedCategory,
  onCategoryClick,
  onTagClick,
}: BlogListingSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categorii</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button
                onClick={() => onCategoryClick("all")}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md transition-colors text-sm",
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <span className="flex items-center justify-between">
                  <span>Toate articolele</span>
                  <span className="text-xs opacity-70">
                    {categories.reduce((sum, cat) => sum + cat.count, 0)}
                  </span>
                </span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => onCategoryClick(cat.category)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md transition-colors text-sm",
                    selectedCategory === cat.category
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <span className="flex items-center justify-between">
                    <span>{CATEGORY_LABELS[cat.category]}</span>
                    <span className="text-xs opacity-70">{cat.count}</span>
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags Cloud */}
      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Etichete Populare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                // Size based on frequency (normalized)
                const maxCount = Math.max(...tags.map((t) => t.count));
                const size = tag.count === maxCount ? "default" : "sm";
                
                return (
                  <button
                    key={tag.tag}
                    onClick={() => onTagClick(tag.tag)}
                    className="transition-transform hover:scale-110"
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "cursor-pointer hover:bg-primary hover:text-primary-foreground",
                        size === "default" ? "text-base py-1.5" : "text-sm"
                      )}
                    >
                      {tag.tag}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Newsletter Signup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Primește articole noi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Abonează-te pentru a primi notificări despre articolele noi
          </p>
          <NewsletterSignup variant="sidebar" source="blog-sidebar" />
        </CardContent>
      </Card>
    </div>
  );
}
