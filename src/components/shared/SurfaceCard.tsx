import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SurfaceCardTone = "default" | "muted" | "accent" | "success" | "warning" | "danger";
type SurfaceCardDensity = "compact" | "default" | "spacious";

const toneClasses: Record<SurfaceCardTone, string> = {
  default: "border-border bg-card text-card-foreground",
  muted: "border-border/70 bg-secondary/40 text-foreground",
  accent: "border-primary/20 bg-primary/5 text-foreground",
  success: "border-emerald-500/20 bg-emerald-500/5 text-foreground",
  warning: "border-amber-500/25 bg-amber-500/5 text-foreground",
  danger: "border-destructive/25 bg-destructive/5 text-foreground",
};

const densityClasses: Record<SurfaceCardDensity, { header: string; content: string }> = {
  compact: { header: "p-4 pb-2", content: "p-4 pt-2" },
  default: { header: "p-5 pb-3", content: "p-5 pt-2" },
  spacious: { header: "p-6 pb-4", content: "p-6 pt-2" },
};

interface SurfaceCardProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  tone?: SurfaceCardTone;
  density?: SurfaceCardDensity;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function SurfaceCard({
  title,
  description,
  action,
  children,
  tone = "default",
  density = "default",
  className,
  headerClassName,
  contentClassName,
}: SurfaceCardProps) {
  const showHeader = Boolean(title || description || action);
  const densityClass = densityClasses[density];

  return (
    <Card
      className={cn("overflow-hidden rounded-xl border shadow-sm", toneClasses[tone], className)}
    >
      {showHeader && (
        <CardHeader
          className={cn(
            "flex flex-row items-start justify-between gap-4 space-y-0",
            densityClass.header,
            headerClassName,
          )}
        >
          <div className="min-w-0 space-y-1">
            {title && (
              <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
            )}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </CardHeader>
      )}
      {children && (
        <CardContent className={cn(densityClass.content, contentClassName)}>{children}</CardContent>
      )}
    </Card>
  );
}
