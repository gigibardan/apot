import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Fragment } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string; // Optional - last item typically has no href
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumbs Component
 * Provides visual navigation breadcrumbs + schema.org structured data
 */
export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  // Generate schema.org BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Acasă",
        "item": window.location.origin,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": item.href ? `${window.location.origin}${item.href}` : undefined,
      })),
    ],
  };

  return (
    <>
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      {/* Visual Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}
      >
        {/* Home */}
        <Link
          to="/"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          aria-label="Acasă"
        >
          <Home className="h-4 w-4" />
          <span className="sr-only md:not-sr-only">Acasă</span>
        </Link>

        {/* Items */}
        {items.map((item, index) => (
          <Fragment key={index}>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            {item.href && index < items.length - 1 ? (
              <Link
                to={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="font-medium text-foreground"
                aria-current={index === items.length - 1 ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </Fragment>
        ))}
      </nav>
    </>
  );
}
