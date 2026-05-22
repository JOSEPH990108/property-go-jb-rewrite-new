"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FormDialogProps {
  /** Controlled open state. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Form field contents rendered inside the dialog body. */
  children: ReactNode;
  /** Called when the form is submitted (via native form submit). */
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Disables submit button and shows spinner. */
  isLoading?: boolean;
  /** Text for the submit button. @default "Save" */
  submitLabel?: string;
  /** Optional trigger element (e.g. an Edit button). */
  trigger?: ReactNode;
  /** Optional extra className for DialogContent. */
  className?: string;
}

/**
 * Reusable Dialog wrapping a `<form>` with header, body (children),
 * and a footer containing a submit button with loading state.
 *
 * Eliminates repeated Dialog+Form+loading boilerplate found in
 * UserInfoCard, PhoneVerificationModal, and similar components.
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  isLoading = false,
  submitLabel = "Save",
  trigger,
  className,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={className ?? "sm:max-w-[425px]"}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
