import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "accent";
}

const variantClasses = {
  default: "bg-background",
  muted: "bg-muted/30",
  accent: "bg-gradient-to-b from-primary/5 to-transparent",
};

/**
 * Section Component
 * Provides consistent vertical spacing and background variants
 */
export function Section({
  children,
  className,
  variant = "default",
}: SectionProps) {
  return (
    <section
      className={cn(
        "py-12 md:py-16 lg:py-24",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </section>
  );
}
