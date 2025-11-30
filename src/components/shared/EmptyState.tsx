import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

/**
 * EmptyState Component
 * Engaging empty state with positive messaging
 * Provides alternative action to keep users engaged
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-4",
        className
      )}
    >
      {/* Icon/Illustration */}
      {icon && (
        <div className="mb-6 text-6xl opacity-50" aria-hidden="true">
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="max-w-md space-y-3 mb-6">
        <h3 className="text-2xl font-display font-bold tracking-tight">
          {title}
        </h3>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Action */}
      {action && (
        <Button
          size="lg"
          onClick={action.onClick}
          asChild={!!action.href}
        >
          {action.href ? (
            <a href={action.href}>{action.label}</a>
          ) : (
            action.label
          )}
        </Button>
      )}
    </div>
  );
}
