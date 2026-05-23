"use client";

import type { ReactNode } from "react";
import { Plus, Search } from "lucide-react";

import { cn } from "@/lib/utils";

interface AdminTableToolbarProps {
  eyebrow: string;
  title: string;
  description?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  createLabel?: string;
  onCreate?: () => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  actions?: ReactNode;
  className?: string;
}

export function AdminTableToolbar({
  eyebrow,
  title,
  description,
  searchValue,
  onSearchChange,
  createLabel = "Add New",
  onCreate,
  searchPlaceholder = "Search records...",
  searchLabel = "Search records",
  actions,
  className,
}: AdminTableToolbarProps) {
  return (
    <div
      className={cn(
        "border-border flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div>
        <p className="text-primary/80 text-xs tracking-[0.24em] uppercase">{eyebrow}</p>
        <h2 className="text-foreground mt-2 text-2xl font-semibold">{title}</h2>
        {description && <p className="text-foreground/70 mt-1 text-sm">{description}</p>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {actions ?? (
          <button
            type="button"
            onClick={onCreate}
            className="border-primary/20 from-primary to-accent text-primary-foreground inline-flex items-center justify-center gap-2 rounded-2xl border bg-gradient-to-r px-4 py-3 text-sm font-semibold shadow-[0_0_32px_hsl(var(--primary)/0.3)] transition hover:shadow-[0_0_40px_hsl(var(--primary)/0.4)]"
          >
            <Plus className="h-4 w-4" />
            {createLabel}
          </button>
        )}

        <label className="border-border bg-background text-foreground/70 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm">
          <Search className="text-primary h-4 w-4" />
          <input
            aria-label={searchLabel}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="text-foreground placeholder:text-foreground/45 w-full bg-transparent text-sm outline-none sm:min-w-64"
          />
        </label>
      </div>
    </div>
  );
}
