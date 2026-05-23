import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "accent";

export type CommonStatus =
  | "active"
  | "available"
  | "cancelled"
  | "completed"
  | "draft"
  | "error"
  | "failed"
  | "inactive"
  | "live"
  | "pending"
  | "published"
  | "reserved"
  | "sold"
  | "success"
  | "unavailable"
  | "warning";

const statusToneMap: Record<CommonStatus, StatusBadgeTone> = {
  active: "success",
  available: "success",
  cancelled: "neutral",
  completed: "success",
  draft: "neutral",
  error: "danger",
  failed: "danger",
  inactive: "neutral",
  live: "success",
  pending: "warning",
  published: "success",
  reserved: "warning",
  sold: "danger",
  success: "success",
  unavailable: "neutral",
  warning: "warning",
};

const toneClasses: Record<StatusBadgeTone, string> = {
  neutral: "border-border bg-secondary text-secondary-foreground",
  info: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "border-destructive/25 bg-destructive/10 text-destructive",
  accent: "border-primary/20 bg-primary/10 text-primary",
};

function toTitleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

interface StatusBadgeProps {
  status: CommonStatus | (string & {});
  label?: ReactNode;
  tone?: StatusBadgeTone;
  icon?: LucideIcon;
  className?: string;
}

export function StatusBadge({ status, label, tone, icon: Icon, className }: StatusBadgeProps) {
  const resolvedTone = tone ?? statusToneMap[status as CommonStatus] ?? "neutral";

  return (
    <Badge variant="outline" className={cn("capitalize", toneClasses[resolvedTone], className)}>
      {Icon && <Icon className="size-3" />}
      {label ?? toTitleCase(status)}
    </Badge>
  );
}
