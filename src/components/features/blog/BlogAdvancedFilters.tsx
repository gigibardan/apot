import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BlogFiltersState {
  category?: string;
  sortBy?: string;
  featured?: boolean;
}

interface BlogAdvancedFiltersProps {
  filters: BlogFiltersState;
  onChange: (filters: BlogFiltersState) => void;
}

/**
 * Advanced Filters for Blog Articles
 * Supports filtering by category, featured status, and sorting
 */
export function BlogAdvancedFilters({
  filters,
  onChange
}: BlogAdvancedFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== "");

  const clearFilters = () => {
    onChange({});
  };

  const removeFilter = (key: keyof BlogFiltersState) => {
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
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              Categorie
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter("category")}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category */}
        <div className="space-y-2">
          <Label>Categorie</Label>
          <Select 
            value={filters.category || ""} 
            onValueChange={(value) => onChange({ ...filters, category: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toate categoriile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toate categoriile</SelectItem>
              <SelectItem value="călătorii">Călătorii</SelectItem>
              <SelectItem value="cultură">Cultură</SelectItem>
              <SelectItem value="istorie">Istorie</SelectItem>
              <SelectItem value="natură">Natură</SelectItem>
              <SelectItem value="gastronomie">Gastronomie</SelectItem>
              <SelectItem value="aventură">Aventură</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label>Sortare</Label>
          <Select 
            value={filters.sortBy || "newest"} 
            onValueChange={(value) => onChange({ ...filters, sortBy: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Cele mai noi</SelectItem>
              <SelectItem value="oldest">Cele mai vechi</SelectItem>
              <SelectItem value="popular">Cele mai citite</SelectItem>
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
