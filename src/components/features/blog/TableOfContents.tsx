import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
  variant?: "sidebar" | "mobile";
}

export function TableOfContents({
  content,
  className,
  variant = "sidebar",
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Extract headings from HTML content
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const headingElements = doc.querySelectorAll("h2, h3");

    const items: TOCItem[] = [];
    headingElements.forEach((heading) => {
      const text = heading.textContent || "";
      const level = parseInt(heading.tagName[1]);
      
      // Generate ID from text (slug)
      const id = text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      items.push({ id, text, level });
    });

    setHeadings(items);
  }, [content]);

  // Scroll spy - track active heading
  useEffect(() => {
    if (headings.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -80% 0px",
      }
    );

    // Observe all heading elements in the actual DOM
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for fixed header
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
      
      if (variant === "mobile") {
        setIsOpen(false);
      }
    }
  };

  if (headings.length === 0) return null;

  // Mobile collapsible version
  if (variant === "mobile") {
    return (
      <div className={cn("bg-muted/50 rounded-lg", className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 text-left"
          aria-expanded={isOpen}
        >
          <h3 className="font-semibold">Cuprins</h3>
          <ChevronDown
            className={cn(
              "w-5 h-5 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>
        {isOpen && (
          <nav className="px-4 pb-4">
            <ul className="space-y-2">
              {headings.map((heading) => (
                <li
                  key={heading.id}
                  className={cn(
                    heading.level === 3 && "ml-4"
                  )}
                >
                  <button
                    onClick={() => scrollToHeading(heading.id)}
                    className={cn(
                      "text-sm text-left hover:text-primary transition-colors",
                      activeId === heading.id
                        ? "text-primary font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {heading.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    );
  }

  // Sidebar sticky version
  return (
    <nav className={cn("space-y-2", className)} aria-label="Table of contents">
      <h3 className="font-semibold mb-3">Cuprins</h3>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={cn(
              heading.level === 3 && "ml-4"
            )}
          >
            <button
              onClick={() => scrollToHeading(heading.id)}
              className={cn(
                "text-left hover:text-primary transition-colors border-l-2 pl-3 py-1 w-full",
                activeId === heading.id
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground"
              )}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
