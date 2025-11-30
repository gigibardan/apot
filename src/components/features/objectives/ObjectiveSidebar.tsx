import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShareButtons } from "./ShareButtons";
import type { ObjectiveWithRelations } from "@/types/database.types";
import { MapPin, Eye, Award, Star } from "lucide-react";
import { trackJinfoursClick } from "@/lib/analytics/events";

interface ObjectiveSidebarProps {
  objective: ObjectiveWithRelations;
}

export function ObjectiveSidebar({ objective }: ObjectiveSidebarProps) {
  const handleJinfoursClick = () => {
    if (objective.country) {
      trackJinfoursClick("objective-sidebar", objective.country.name, "sidebar-cta");
      window.open("https://jinfotours.ro", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informații Rapide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location */}
          {objective.country && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Locație</p>
                <p className="font-medium">
                  {objective.country.flag_emoji && `${objective.country.flag_emoji} `}
                  {objective.country.name}
                </p>
                {objective.continent && (
                  <p className="text-sm text-muted-foreground">{objective.continent.name}</p>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Types */}
          {objective.types && objective.types.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Tipuri</p>
              <div className="flex flex-wrap gap-2">
                {objective.types.slice(0, 5).map((rel: any) => (
                  <Badge
                    key={rel.type.id}
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: rel.type.color ? `${rel.type.color}20` : undefined,
                      color: rel.type.color || undefined,
                    }}
                  >
                    {rel.type.icon && <span className="mr-1">{rel.type.icon}</span>}
                    {rel.type.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* UNESCO */}
          {objective.unesco_site && (
            <>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Sit UNESCO</p>
                  {objective.unesco_year && (
                    <p className="text-sm text-muted-foreground">Din anul {objective.unesco_year}</p>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Featured */}
          {objective.featured && (
            <>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                <p className="font-medium">Obiectiv Recomandat</p>
              </div>
              <Separator />
            </>
          )}

          {/* Views */}
          {objective.views_count !== undefined && objective.views_count > 0 && (
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Vizualizări</p>
                <p className="font-medium">{objective.views_count.toLocaleString("ro-RO")}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Jinfotours CTA */}
      {objective.country && (
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-lg">Călătorește Organizat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Descoperă circuite complete în {objective.country.name} și alte destinații fascinante
            </p>
            <Button onClick={handleJinfoursClick} className="w-full" variant="default">
              Vezi Circuite Jinfotours
            </Button>
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
            title={objective.title}
            description={objective.excerpt || undefined}
            url={typeof window !== "undefined" ? window.location.href : ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
