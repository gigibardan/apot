import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart } from "lucide-react";
import { Link } from "react-router-dom";

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  views_count: number;
  likes_count?: number;
  featured_image?: string;
}

interface TopContentTableProps {
  title: string;
  data: ContentItem[];
  type: "objectives" | "articles";
}

export function TopContentTable({ title, data, type }: TopContentTableProps) {
  const getLinkPath = (slug: string) => {
    return type === "objectives" ? `/obiective/${slug}` : `/blog/${slug}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <Link
              key={item.id}
              to={getLinkPath(item.slug)}
              target="_blank"
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                {index + 1}
              </div>
              
              {item.featured_image && (
                <img
                  src={item.featured_image}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.title}</p>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span>{item.views_count.toLocaleString()}</span>
                  </div>
                  {item.likes_count !== undefined && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Heart className="w-4 h-4" />
                      <span>{item.likes_count.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
          
          {data.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nicio dată disponibilă
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
