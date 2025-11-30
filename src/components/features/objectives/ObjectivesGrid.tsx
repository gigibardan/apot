import { ObjectiveCard } from "./ObjectiveCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import type { ObjectiveWithRelations } from "@/types/database.types";

interface ObjectivesGridProps {
  objectives: ObjectiveWithRelations[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  hasActiveFilters: boolean;
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
  onRetry: () => void;
}

export function ObjectivesGrid({
  objectives,
  loading,
  error,
  totalCount,
  currentPage,
  pageSize,
  sortBy,
  sortOrder,
  hasActiveFilters,
  onSortChange,
  onPageChange,
  onClearFilters,
  onRetry,
}: ObjectivesGridProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startResult = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endResult = Math.min(currentPage * pageSize, totalCount);

  const handleSortChange = (value: string) => {
    const [field, order] = value.split(":");
    onSortChange(field, order as "asc" | "desc");
  };

  const getSortValue = () => `${sortBy}:${sortOrder}`;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push("ellipsis");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis");
    }

    pages.push(totalPages);

    return pages;
  };

  // Loading State
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <EmptyState
        icon="❌"
        title="Oops! Ceva nu a mers bine"
        description="Nu am putut încărca obiectivele turistice. Te rugăm să încerci din nou."
        action={{
          label: "Încearcă din nou",
          onClick: onRetry,
        }}
      />
    );
  }

  // Empty State
  if (objectives.length === 0) {
    if (hasActiveFilters) {
      return (
        <EmptyState
          icon="🔍"
          title="Niciun obiectiv găsit"
          description="Nu am găsit obiective cu aceste filtre. Încearcă alte criterii de căutare."
          action={{
            label: "Șterge Filtrele",
            onClick: onClearFilters,
          }}
        />
      );
    }

    return (
      <EmptyState
        icon="🗺️"
        title="Obiectivele turistice vor fi adăugate în curând"
        description="Echipa noastră lucrează la crearea primelor destinații fascinante. Revino în curând pentru a descoperi obiective turistice din întreaga lume!"
        action={{
          label: "Explorează Continentele",
          href: "/#continents",
        }}
      />
    );
  }

  // Success State with Results
  return (
    <div className="space-y-8">
      {/* Sorting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Afișare {startResult}-{endResult} din {totalCount} obiective
          </p>
          {hasActiveFilters && (
            <Button
              variant="link"
              onClick={onClearFilters}
              className="h-auto p-0 text-xs"
            >
              Șterge filtrele
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Sortează după:
          </span>
          <Select value={getSortValue()} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="views_count:desc">Cele mai populare</SelectItem>
              <SelectItem value="created_at:desc">Recente</SelectItem>
              <SelectItem value="title:asc">Alfabetic (A-Z)</SelectItem>
              <SelectItem value="title:desc">Alfabetic (Z-A)</SelectItem>
              <SelectItem value="unesco_site:desc">Situri UNESCO</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Objectives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {objectives.map((objective, index) => (
          <ObjectiveCard key={objective.id} objective={objective} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 pt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {getPageNumbers().map((page, idx) => (
                <PaginationItem key={idx}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => onPageChange(page as number)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    currentPage < totalPages && onPageChange(currentPage + 1)
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <p className="text-sm text-muted-foreground">
            Pagina {currentPage} din {totalPages}
          </p>
        </div>
      )}
    </div>
  );
}
