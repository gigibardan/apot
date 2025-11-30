import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "accent" | "neutral";
  fullPage?: boolean;
  className?: string;
}

/**
 * Loading Spinner Component
 * Accessible loading indicator with size and color variants
 */
export function LoadingSpinner({
  size = "md",
  color = "primary",
  fullPage = false,
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const colorClasses = {
    primary: "text-primary",
    accent: "text-accent",
    neutral: "text-muted-foreground",
  };

  const spinner = (
    <Loader2
      className={cn(
        "animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      aria-label="Se încarcă"
      role="status"
    />
  );

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {spinner}
        <span className="sr-only">Se încarcă...</span>
      </div>
    );
  }

  return (
    <>
      {spinner}
      <span className="sr-only">Se încarcă...</span>
    </>
  );
}
