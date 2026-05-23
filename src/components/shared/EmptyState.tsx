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
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border/50 bg-card/10 flex h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center backdrop-blur-sm",
        className,
      )}
    >
      <div className="bg-primary/5 ring-primary/20 mb-6 flex h-20 w-20 items-center justify-center rounded-full ring-1">
        <Icon className="text-primary/80 h-10 w-10" />
      </div>
      <h3 className="mb-3 text-2xl font-bold tracking-tight">{title}</h3>
      <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          disabled={action.isLoading}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 gap-2 shadow-lg transition-all duration-300"
        >
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.isLoading ? (action.loadingLabel ?? "Loading...") : action.label}
        </Button>
      )}
    </div>
  );
}
