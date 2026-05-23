"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
}

export function FilterChip({
  active = false,
  children,
  onClick,
  icon: Icon,
  disabled,
  className,
}: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground",
        className,
      )}
    >
      {Icon && <Icon className="size-4" />}
      {children}
    </button>
  );
}
