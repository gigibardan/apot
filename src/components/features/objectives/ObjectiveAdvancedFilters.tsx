import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ObjectiveFiltersState {
  country?: string;
  continent?: string;
  type?: string;
  difficulty?: string;
  unesco?: boolean;
  featured?: boolean;
  sortBy?: string;
}

interface ObjectiveAdvancedFiltersProps {
  filters: ObjectiveFiltersState;
  onChange: (filters: ObjectiveFiltersState) => void;
  countries?: Array<{ id: string; name: string }>;
  continents?: Array<{ id: string; name: string }>;
  types?: Array<{ id: string; name: string }>;
}

/**
 * Advanced Filters for Objectives
 * Supports filtering by country, continent, type, difficulty, UNESCO status
 */
export function ObjectiveAdvancedFilters({
  filters,
  onChange,
  countries = [],
  continents = [],
  types = []
}: ObjectiveAdvancedFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== "");

  const clearFilters = () => {
    onChange({});
  };

  const removeFilter = (key: keyof ObjectiveFiltersState) => {
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
          {filters.continent && (
            <Badge variant="secondary" className="gap-1">
              Continent
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter("continent")}
              />
            </Badge>
          )}
          {filters.country && (
            <Badge variant="secondary" className="gap-1">
              Țară
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter("country")}
              />
            </Badge>
          )}
          {filters.type && (
            <Badge variant="secondary" className="gap-1">
              Tip
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter("type")}
              />
            </Badge>
          )}
          {filters.difficulty && (
            <Badge variant="secondary" className="gap-1">
              Dificultate
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter("difficulty")}
              />
            </Badge>
          )}
          {filters.unesco && (
            <Badge variant="secondary" className="gap-1">
              UNESCO
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter("unesco")}
              />
            </Badge>
          )}
          {filters.featured && (
            <Badge variant="secondary" className="gap-1">
              Recomandate
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
        {/* Continent */}
        <div className="space-y-2">
          <Label>Continent</Label>
          <Select 
            value={filters.continent || ""} 
            onValueChange={(value) => onChange({ ...filters, continent: value || undefined, country: undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toate continentele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toate continentele</SelectItem>
              {continents.map((continent) => (
                <SelectItem key={continent.id} value={continent.id}>
                  {continent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label>Țară</Label>
          <Select 
            value={filters.country || ""} 
            onValueChange={(value) => onChange({ ...filters, country: value || undefined })}
            disabled={!filters.continent}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toate țările" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toate țările</SelectItem>
              {countries
                .filter(c => !filters.continent || c.id === filters.continent)
                .map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label>Tip obiectiv</Label>
          <Select 
            value={filters.type || ""} 
            onValueChange={(value) => onChange({ ...filters, type: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toate tipurile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toate tipurile</SelectItem>
              {types.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <Label>Dificultate</Label>
          <Select 
            value={filters.difficulty || ""} 
            onValueChange={(value) => onChange({ ...filters, difficulty: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toate nivelurile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toate nivelurile</SelectItem>
              <SelectItem value="easy">Ușor</SelectItem>
              <SelectItem value="moderate">Moderat</SelectItem>
              <SelectItem value="difficult">Dificil</SelectItem>
              <SelectItem value="extreme">Extrem</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label>Sortare</Label>
          <Select 
            value={filters.sortBy || "popular"} 
            onValueChange={(value) => onChange({ ...filters, sortBy: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Cele mai populare</SelectItem>
              <SelectItem value="newest">Cele mai noi</SelectItem>
              <SelectItem value="alphabetical">Alfabetic (A-Z)</SelectItem>
              <SelectItem value="featured">Recomandate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Special Filters */}
        <div className="space-y-2">
          <Label>Filtre speciale</Label>
          <div className="flex gap-2">
            <Button
              variant={filters.unesco ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ ...filters, unesco: filters.unesco ? undefined : true })}
            >
              UNESCO
            </Button>
            <Button
              variant={filters.featured ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ ...filters, featured: filters.featured ? undefined : true })}
            >
              Recomandate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
