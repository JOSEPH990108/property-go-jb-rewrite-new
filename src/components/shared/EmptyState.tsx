import type { LucideIcon } from "lucide-react";
import { StateBlock } from "@/components/shared/StateBlock";

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
    <StateBlock
      icon={Icon}
      title={title}
      description={description}
      action={action}
      density="page"
      className={className}
    />
  );
}
