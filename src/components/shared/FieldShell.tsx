import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldShellProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  helperText?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function FieldShell({
  label,
  htmlFor,
  required,
  helperText,
  error,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-destructive text-xs leading-5">{error}</p>
      ) : helperText ? (
        <p className="text-muted-foreground text-xs leading-5">{helperText}</p>
      ) : null}
    </div>
  );
}
