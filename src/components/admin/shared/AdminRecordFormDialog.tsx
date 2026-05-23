"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AdminRecordFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  entityLabel: string;
  children: ReactNode;
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
  description?: string;
  createLabel?: string;
  editLabel?: string;
  className?: string;
  bodyClassName?: string;
}

export function AdminRecordFormDialog({
  open,
  onOpenChange,
  mode,
  entityLabel,
  children,
  onCancel,
  onSave,
  isSaving,
  description = "Fill in the fields below and save.",
  createLabel = "Create",
  editLabel = "Save Changes",
  className,
  bodyClassName,
}: AdminRecordFormDialogProps) {
  const actionLabel = mode === "create" ? createLabel : editLabel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-h-[85vh] overflow-y-auto sm:max-w-2xl", className)}>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create" : "Edit"} {entityLabel} Record
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className={cn("grid gap-4 py-4 sm:grid-cols-2", bodyClassName)}>{children}</div>

        <DialogFooter>
          <button
            type="button"
            onClick={onCancel}
            className="border-border bg-background text-foreground hover:bg-muted/50 rounded-2xl border px-5 py-2.5 text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="border-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {actionLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
