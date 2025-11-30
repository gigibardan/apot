import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShareButtons } from "../objectives/ShareButtons";
import { TableOfContents } from "./TableOfContents";
import type { BlogArticle } from "@/types/database.types";

interface BlogSidebarProps {
  article: BlogArticle;
}

// Mock author data - replace with real data from database when available
const MOCK_AUTHOR = {
  name: "Echipa APOT",
  avatar: "/placeholder.svg",
  bio: "Pasionați de călătorii și explorare, împărtășim povești și ghiduri pentru a-ți inspira următoarea aventură.",
  twitter: "https://twitter.com",
  linkedin: "https://linkedin.com",
};

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

      {/* Author Box */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Despre Autor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={MOCK_AUTHOR.avatar} alt={MOCK_AUTHOR.name} />
              <AvatarFallback>{MOCK_AUTHOR.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{MOCK_AUTHOR.name}</h4>
              <p className="text-sm text-muted-foreground mt-2">
                {MOCK_AUTHOR.bio}
              </p>
            </div>
            {/* Social Links - uncomment when data available
            <div className="flex gap-3">
              {MOCK_AUTHOR.twitter && (
                <a
                  href={MOCK_AUTHOR.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {MOCK_AUTHOR.linkedin && (
                <a
                  href={MOCK_AUTHOR.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>
            */}
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
