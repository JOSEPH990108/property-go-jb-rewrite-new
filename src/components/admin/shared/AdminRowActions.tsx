"use client";

import type { MouseEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminRowActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  disabled?: boolean;
  className?: string;
}

function handleActionClick(event: MouseEvent<HTMLButtonElement>, action?: () => void) {
  event.stopPropagation();
  action?.();
}

export function AdminRowActions({
  onEdit,
  onDelete,
  editLabel = "Edit record",
  deleteLabel = "Delete record",
  disabled,
  className,
}: AdminRowActionsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        aria-label={editLabel}
        disabled={disabled || !onEdit}
        onClick={(event) => handleActionClick(event, onEdit)}
        className="text-foreground/60 hover:bg-primary/10 hover:text-primary inline-flex h-8 w-8 items-center justify-center rounded-xl transition disabled:pointer-events-none disabled:opacity-40"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        aria-label={deleteLabel}
        disabled={disabled || !onDelete}
        onClick={(event) => handleActionClick(event, onDelete)}
        className="text-foreground/60 hover:bg-destructive/10 hover:text-destructive inline-flex h-8 w-8 items-center justify-center rounded-xl transition disabled:pointer-events-none disabled:opacity-40"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
