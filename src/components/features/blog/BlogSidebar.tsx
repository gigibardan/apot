import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShareButtons } from "../objectives/ShareButtons";
import { TableOfContents } from "./TableOfContents";
import type { BlogArticle } from "@/types/database.types";

interface BlogSidebarProps {
  article: BlogArticle;
}

export function BlogSidebar({ article }: BlogSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Table of Contents */}
      {article.content && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cuprins</CardTitle>
          </CardHeader>
          <CardContent>
            <TableOfContents content={article.content} variant="sidebar" />
          </CardContent>
        </Card>
      )}

      {/* Share Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuie</CardTitle>
        </CardHeader>
        <CardContent>
          <ShareButtons
            title={article.title}
            description={article.excerpt || undefined}
            url={typeof window !== "undefined" ? window.location.href : ""}
          />
        </CardContent>
      </Card>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Etichete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
