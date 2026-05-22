import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Primary action button. */
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    isLoading?: boolean;
    loadingLabel?: string;
  };
  className?: string;
}

/**
 * Generic empty-state placeholder. Replaces the appointment-specific empty
 * state and can be reused across any list/table/page.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-[60vh] text-center p-8 border border-dashed border-border/50 rounded-2xl bg-card/10 backdrop-blur-sm",
        className,
      )}
    >
      <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6 ring-1 ring-primary/20">
        <Icon className="w-10 h-10 text-primary/80" />
      </div>
      <h3 className="text-2xl font-bold mb-3 tracking-tight">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          disabled={action.isLoading}
          size="lg"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300"
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.isLoading ? (action.loadingLabel ?? "Loading...") : action.label}
        </Button>
      )}
    </div>
  );
}
