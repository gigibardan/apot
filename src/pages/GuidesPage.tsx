import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getGuides, getGuideSpecializations, getGuideRegions } from "@/lib/supabase/queries/guides";
import { Search, Star, Shield, MapPin, Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GuidesPage() {
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState<string>("");
  const [region, setRegion] = useState<string>("");

  const { data: guides, isLoading } = useQuery({
    queryKey: ["guides", search, specialization, region],
    queryFn: () =>
      getGuides({
        search: search || undefined,
        specialization: specialization || undefined,
        region: region || undefined,
      }),
  });

  const { data: specializations } = useQuery({
    queryKey: ["guide-specializations"],
    queryFn: getGuideSpecializations,
  });

  const { data: regions } = useQuery({
    queryKey: ["guide-regions"],
    queryFn: getGuideRegions,
  });

  return (
    <>
      <SEO
        title="Ghizi Profesioniști Verificați | APOT"
        description="Descoperă ghizii noștri profesioniști verificați pentru experiențe de călătorie autentice în întreaga lume."
      />

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Shield className="h-3 w-3 mr-1" />
            Ghizi Verificați
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Ghizii Noștri Profesioniști
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experți locali verificați care transformă călătoriile în experiențe memorabile
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Caută ghid..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={specialization} onValueChange={setSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="Specializare" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate</SelectItem>
                {specializations?.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Regiune" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate</SelectItem>
                {regions?.map((reg) => (
                  <SelectItem key={reg} value={reg}>
                    {reg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Guides Grid */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides?.guides.map((guide) => (
              <Link key={guide.id} to={`/ghid/${guide.slug}`}>
                <Card className="p-6 hover:shadow-lg transition-shadow h-full">
                  <div className="flex items-start gap-4 mb-4">
                    {guide.profile_image ? (
                      <img
                        src={guide.profile_image}
                        alt={guide.full_name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">
                          {guide.full_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{guide.full_name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{guide.rating_average.toFixed(1)}</span>
                        <span>({guide.reviews_count})</span>
                      </div>
                    </div>
                    {guide.verified && (
                      <Badge variant="default">
                        <Shield className="h-3 w-3 mr-1" />
                        Verificat
                      </Badge>
                    )}
                  </div>

                  {guide.short_description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {guide.short_description}
                    </p>
                  )}

                  <div className="space-y-2">
                    {guide.specializations && guide.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {guide.specializations.slice(0, 3).map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {guide.specializations.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{guide.specializations.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {guide.geographical_areas?.slice(0, 2).join(", ")}
                        {guide.geographical_areas && guide.geographical_areas.length > 2 &&
                          ` +${guide.geographical_areas.length - 2}`}
                      </span>
                    </div>

                    {guide.languages && guide.languages.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Languages className="h-4 w-4" />
                        <span>{guide.languages.join(", ")}</span>
                      </div>
                    )}

                    {guide.years_experience && (
                      <div className="text-sm font-medium text-primary">
                        {guide.years_experience} ani experiență
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && guides?.guides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Nu am găsit ghizi care să corespundă criteriilor tale.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
