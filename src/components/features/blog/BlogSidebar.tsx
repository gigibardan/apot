import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShareButtons } from "../objectives/ShareButtons";
import { TableOfContents } from "./TableOfContents";
import type { BlogArticle } from "@/types/database.types";

interface BlogSidebarProps {
  article: BlogArticle & { 
    author?: { id: string; full_name: string | null; avatar_url: string | null; bio: string | null } | null 
  };
}

// Default author data when no author is set
const DEFAULT_AUTHOR = {
  name: "Echipa APOT",
  bio: "Pasionați de călătorii și explorare, împărtășim povești și ghiduri pentru a-ți inspira următoarea aventură.",
};

export function BlogSidebar({ article }: BlogSidebarProps) {
  // Use author data from article if available, otherwise use default
  const authorName = article.author?.full_name || DEFAULT_AUTHOR.name;
  const authorAvatar = article.author?.avatar_url || null;
  const authorBio = article.author?.bio || DEFAULT_AUTHOR.bio;
  const authorInitial = authorName.charAt(0).toUpperCase();

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

      {/* Author Box */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Despre Autor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="w-20 h-20">
              {authorAvatar ? (
                <AvatarImage src={authorAvatar} alt={authorName} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {authorInitial}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{authorName}</h4>
              <p className="text-sm text-muted-foreground mt-2">
                {authorBio}
              </p>
            </div>
          </div>
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
