import { useState, useEffect } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { getContinents, getCountries, getObjectiveTypes } from "@/lib/supabase/queries/taxonomies";
import type { Continent, Country, ObjectiveType } from "@/types/database.types";

export interface FilterValues {
  search: string;
  continent: string;
  country: string;
  types: string[];
  unesco: boolean;
  featured: boolean;
}

interface ObjectiveFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  onApply?: () => void;
  isMobile?: boolean;
  activeFilterCount?: number;
}

export function ObjectiveFilters({
  filters,
  onFiltersChange,
  onApply,
  isMobile = false,
  activeFilterCount = 0,
}: ObjectiveFiltersProps) {
  const [continents, setContinents] = useState<Continent[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [types, setTypes] = useState<ObjectiveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState(filters.search);

  // Fetch taxonomies
  useEffect(() => {
    async function fetchTaxonomies() {
      try {
        const [continentsData, typesData] = await Promise.all([
          getContinents(),
          getObjectiveTypes(),
        ]);
        setContinents(continentsData);
        setTypes(typesData);
      } catch (error) {
        console.error("Error fetching taxonomies:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTaxonomies();
  }, []);

  // Fetch countries when continent changes
  useEffect(() => {
    async function fetchCountries() {
      if (filters.continent) {
        try {
          // Find continent by slug to get ID
          const continent = continents.find((c) => c.slug === filters.continent);
          if (continent) {
            const countriesData = await getCountries(continent.id);
            setCountries(countriesData);
          }
        } catch (error) {
          console.error("Error fetching countries:", error);
        }
      } else {
        setCountries([]);
      }
    }
    fetchCountries();
  }, [filters.continent, continents]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ ...filters, search: searchValue });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleReset = () => {
    setSearchValue("");
    onFiltersChange({
      search: "",
      continent: "",
      country: "",
      types: [],
      unesco: false,
      featured: false,
    });
  };

  const handleTypeToggle = (typeSlug: string) => {
    const newTypes = filters.types.includes(typeSlug)
      ? filters.types.filter((t) => t !== typeSlug)
      : [...filters.types, typeSlug];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const handleSelectAllTypes = () => {
    onFiltersChange({ ...filters, types: types.map((t) => t.slug) });
  };

  const handleClearTypes = () => {
    onFiltersChange({ ...filters, types: [] });
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Caută</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Caută obiective turistice..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Continent */}
      <div className="space-y-2">
        <Label htmlFor="continent">Continent</Label>
        <Select
          value={filters.continent || "all"}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, continent: value === "all" ? "" : value, country: "" })
          }
        >
          <SelectTrigger id="continent">
            <SelectValue placeholder="Toate Continentele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate Continentele</SelectItem>
            {continents.map((continent) => (
              <SelectItem key={continent.id} value={continent.slug}>
                {continent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Country */}
      <div className="space-y-2">
        <Label htmlFor="country">Țară</Label>
        <Select
          value={filters.country || "all"}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, country: value === "all" ? "" : value })
          }
          disabled={!filters.continent}
        >
          <SelectTrigger id="country">
            <SelectValue placeholder="Toate Țările" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate Țările</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country.id} value={country.slug}>
                {country.flag_emoji && `${country.flag_emoji} `}
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Objective Types */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Tipuri de Obiective</Label>
          <div className="flex gap-2 text-xs">
            <button
              onClick={handleSelectAllTypes}
              className="text-primary hover:underline"
            >
              Toate
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={handleClearTypes}
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              Niciuna
            </button>
          </div>
        </div>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-3">
            {types.map((type) => (
              <div key={type.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`type-${type.slug}`}
                  checked={filters.types.includes(type.slug)}
                  onCheckedChange={() => handleTypeToggle(type.slug)}
                />
                <Label
                  htmlFor={`type-${type.slug}`}
                  className="flex-1 cursor-pointer"
                >
                  <Badge
                    variant="secondary"
                    className="font-normal"
                    style={{
                      backgroundColor: type.color
                        ? `${type.color}20`
                        : undefined,
                      color: type.color || undefined,
                    }}
                  >
                    {type.icon && <span className="mr-1">{type.icon}</span>}
                    {type.name}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* UNESCO Toggle */}
      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
        <Checkbox
          id="unesco"
          checked={filters.unesco}
          onCheckedChange={(checked) =>
            onFiltersChange({ ...filters, unesco: !!checked })
          }
        />
        <Label htmlFor="unesco" className="cursor-pointer flex-1">
          Doar Situri UNESCO 🌍
        </Label>
      </div>

      {/* Featured Toggle */}
      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
        <Checkbox
          id="featured"
          checked={filters.featured}
          onCheckedChange={(checked) =>
            onFiltersChange({ ...filters, featured: !!checked })
          }
        />
        <Label htmlFor="featured" className="cursor-pointer flex-1">
          Doar Obiective Recomandate ⭐
        </Label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={handleReset} variant="outline" className="flex-1">
          Resetează
        </Button>
        {isMobile && onApply && (
          <Button onClick={onApply} className="flex-1">
            Aplică Filtre
          </Button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  // Mobile: Sheet/Drawer
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg h-14 w-14 p-0"
          >
            <SlidersHorizontal className="h-5 w-5" />
            {activeFilterCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
            <span className="sr-only">Filtre</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh]">
          <SheetHeader>
            <SheetTitle>Filtrează Obiective</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(85vh-80px)] mt-6">
            <div className="pr-6">
              <FiltersContent />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Sidebar
  return (
    <aside className="w-full space-y-6 sticky top-20">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filtrează</h2>
        {activeFilterCount > 0 && (
          <Badge variant="secondary">{activeFilterCount} active</Badge>
        )}
      </div>
      <FiltersContent />
    </aside>
  );
}
