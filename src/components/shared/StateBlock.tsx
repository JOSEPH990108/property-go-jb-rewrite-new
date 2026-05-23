"use client";

import type { LucideIcon } from "lucide-react";
import { AlertCircle, CheckCircle2, Info, Loader2, SearchX, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StateBlockTone = "empty" | "loading" | "info" | "success" | "warning" | "error";
type StateBlockDensity = "compact" | "default" | "page";

const toneDefaults: Record<StateBlockTone, { icon: LucideIcon; iconClassName: string }> = {
  empty: { icon: SearchX, iconClassName: "text-muted-foreground" },
  loading: { icon: Loader2, iconClassName: "text-primary animate-spin" },
  info: { icon: Info, iconClassName: "text-sky-500" },
  success: { icon: CheckCircle2, iconClassName: "text-emerald-500" },
  warning: { icon: TriangleAlert, iconClassName: "text-amber-500" },
  error: { icon: AlertCircle, iconClassName: "text-destructive" },
};

const densityClasses: Record<StateBlockDensity, string> = {
  compact: "min-h-32 p-4",
  default: "min-h-56 p-6",
  page: "min-h-[50vh] p-8",
};

interface StateBlockProps {
  title: string;
  description?: string;
  tone?: StateBlockTone;
  density?: StateBlockDensity;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    isLoading?: boolean;
    loadingLabel?: string;
  };
  className?: string;
}

export function StateBlock({
  title,
  description,
  tone = "empty",
  density = "default",
  icon,
  action,
  className,
}: StateBlockProps) {
  const toneDefault = toneDefaults[tone];
  const Icon = icon ?? toneDefault.icon;
  const ActionIcon = action?.icon;

  return (
    <div
      className={cn(
        "border-border/60 bg-card/30 flex flex-col items-center justify-center rounded-xl border border-dashed text-center",
        densityClasses[density],
        className,
      )}
    >
      <div className="bg-background mb-4 flex size-14 items-center justify-center rounded-full border shadow-sm">
        <Icon className={cn("size-7", toneDefault.iconClassName)} />
      </div>
      <h3 className="text-foreground text-lg font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} disabled={action.isLoading} className="mt-5 gap-2">
          {action.isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            ActionIcon && <ActionIcon className="size-4" />
          )}
          {action.isLoading ? (action.loadingLabel ?? "Loading...") : action.label}
        </Button>
      )}
    </div>
  );
}
