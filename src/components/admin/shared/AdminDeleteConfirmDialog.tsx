"use client";

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

interface AdminDeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  className?: string;
}

export function AdminDeleteConfirmDialog({
  open,
  onOpenChange,
  onCancel,
  onConfirm,
  isLoading,
  title = "Delete Record",
  description = "Are you sure you want to delete this record? This action cannot be undone.",
  cancelLabel = "Cancel",
  confirmLabel = "Delete",
  className,
}: AdminDeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={onCancel}
            className="border-border bg-background text-foreground hover:bg-muted/50 rounded-2xl border px-5 py-2.5 text-sm font-medium transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "border-destructive/20 bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50",
            )}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
