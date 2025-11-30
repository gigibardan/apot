import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface GuideFiltersState {
  region?: string;
  specialization?: string;
  language?: string;
  verified?: boolean;
  featured?: boolean;
  sortBy?: string;
}

interface GuideAdvancedFiltersProps {
  filters: GuideFiltersState;
  onChange: (filters: GuideFiltersState) => void;
}

/**
 * Advanced Filters for Guides
 * Supports filtering by region, specialization, language, verified status
 */
export function GuideAdvancedFilters({
  filters,
  onChange
}: GuideAdvancedFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== "");

  const clearFilters = () => {
    onChange({});
  };

  const removeFilter = (key: keyof GuideFiltersState) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onChange(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Filtre active:</span>
          {filters.region && (
            <Badge variant="secondary" className="gap-1">
              Regiune
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter("region")}
              />
            </Badge>
          )}
          {filters.specialization && (
            <Badge variant="secondary" className="gap-1">
              Specializare
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter("specialization")}
              />
            </Badge>
          )}
          {filters.language && (
            <Badge variant="secondary" className="gap-1">
              Limbă
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter("language")}
              />
            </Badge>
          )}
          {filters.verified && (
            <Badge variant="secondary" className="gap-1">
              Verificat
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter("verified")}
              />
            </Badge>
          )}
          {filters.featured && (
            <Badge variant="secondary" className="gap-1">
              Recomandat
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter("featured")}
              />
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-7 text-xs"
          >
            Șterge toate
          </Button>
        </div>
      )}

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Region */}
        <div className="space-y-2">
          <Label>Regiune</Label>
          <Select 
            value={filters.region || ""} 
            onValueChange={(value) => onChange({ ...filters, region: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toate regiunile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toate regiunile</SelectItem>
              <SelectItem value="transilvania">Transilvania</SelectItem>
              <SelectItem value="muntenia">Muntenia</SelectItem>
              <SelectItem value="moldova">Moldova</SelectItem>
              <SelectItem value="oltenia">Oltenia</SelectItem>
              <SelectItem value="banat">Banat</SelectItem>
              <SelectItem value="crisana">Crișana</SelectItem>
              <SelectItem value="maramures">Maramureș</SelectItem>
              <SelectItem value="bucovina">Bucovina</SelectItem>
              <SelectItem value="dobrogea">Dobrogea</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Specialization */}
        <div className="space-y-2">
          <Label>Specializare</Label>
          <Select 
            value={filters.specialization || ""} 
            onValueChange={(value) => onChange({ ...filters, specialization: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toate specializările" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toate specializările</SelectItem>
              <SelectItem value="istorie">Istorie</SelectItem>
              <SelectItem value="natura">Natură</SelectItem>
              <SelectItem value="cultura">Cultură</SelectItem>
              <SelectItem value="aventura">Aventură</SelectItem>
              <SelectItem value="gastronomie">Gastronomie</SelectItem>
              <SelectItem value="religious">Turism religios</SelectItem>
              <SelectItem value="wine">Turism vinicol</SelectItem>
              <SelectItem value="hiking">Drumeții montane</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label>Limbă vorbită</Label>
          <Select 
            value={filters.language || ""} 
            onValueChange={(value) => onChange({ ...filters, language: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toate limbile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toate limbile</SelectItem>
              <SelectItem value="romana">Română</SelectItem>
              <SelectItem value="engleza">Engleză</SelectItem>
              <SelectItem value="franceza">Franceză</SelectItem>
              <SelectItem value="germana">Germană</SelectItem>
              <SelectItem value="italiana">Italiană</SelectItem>
              <SelectItem value="spaniola">Spaniolă</SelectItem>
              <SelectItem value="maghiara">Maghiară</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label>Sortare</Label>
          <Select 
            value={filters.sortBy || "rating"} 
            onValueChange={(value) => onChange({ ...filters, sortBy: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Rating (mare → mic)</SelectItem>
              <SelectItem value="reviews">Nr. recenzii</SelectItem>
              <SelectItem value="experience">Experiență</SelectItem>
              <SelectItem value="alphabetical">Alfabetic (A-Z)</SelectItem>
              <SelectItem value="featured">Recomandați</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Special Filters */}
        <div className="space-y-2">
          <Label>Filtre speciale</Label>
          <div className="flex gap-2">
            <Button
              variant={filters.verified ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ ...filters, verified: filters.verified ? undefined : true })}
            >
              Verificați
            </Button>
            <Button
              variant={filters.featured ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ ...filters, featured: filters.featured ? undefined : true })}
            >
              Recomandați
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
