import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import type { ForumCategory } from "@/types/forum";
import * as Icons from "lucide-react";

interface CategoryCardProps {
  category: ForumCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const IconComponent = (category.icon && (Icons[category.icon as keyof typeof Icons] as any)) 
    || MessageSquare;

  return (
    <Link to={`/forum/${category.slug}`}>
      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div 
              className="p-3 rounded-lg shrink-0"
              style={{ backgroundColor: category.color || 'hsl(var(--primary))' }}
            >
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {category.description}
                </p>
              )}
              <Badge variant="secondary">
                <MessageSquare className="h-3 w-3 mr-1" />
                {category.posts_count} {category.posts_count === 1 ? 'discuție' : 'discuții'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
