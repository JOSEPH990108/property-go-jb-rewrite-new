"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function MetricCard({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  accent: "blue" | "purple" | "green" | "orange";
}) {
  const accentClasses = {
    blue: "from-blue-500/20 to-blue-500/5 border-blue-200/20",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-200/20",
    green: "from-green-500/20 to-green-500/5 border-green-200/20",
    orange: "from-orange-500/20 to-orange-500/5 border-orange-200/20",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-[20px] border bg-gradient-to-br p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md",
        accentClasses[accent],
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {label}
        </span>
        <div
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            accent === "blue" && "bg-blue-500",
            accent === "purple" && "bg-purple-500",
            accent === "green" && "bg-green-500",
            accent === "orange" && "bg-orange-500",
          )}
        />
      </div>
      <div className="text-foreground mb-2 text-[2.5rem] leading-none font-bold tracking-[-0.05em]">
        {value}
      </div>
      <p className="text-muted-foreground/70 text-xs">{note}</p>
    </motion.div>
  );
}

export function SurfaceCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "border-border/50 from-card/60 to-card/40 hover:border-border overflow-hidden rounded-[28px] border bg-gradient-to-br shadow-md backdrop-blur-xl transition-all duration-300 hover:shadow-lg",
        className,
      )}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-lato text-foreground text-lg font-semibold tracking-[-0.04em]">
              {title}
            </h3>
            <p className="text-muted-foreground/80 mt-1.5 text-sm leading-5">{description}</p>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function OperationsStrip({
  operationsValue,
  operationsTarget,
  transferValue,
  transferTarget,
  transferVolume,
  onScenario,
}: {
  operationsValue: number;
  operationsTarget: number;
  transferValue: number;
  transferTarget: number;
  transferVolume: number;
  onScenario: () => void;
}) {
  const operationsPercent = Math.min(
    100,
    Math.round((operationsValue / Math.max(operationsTarget, 1)) * 100),
  );
  const transferPercent = Math.min(
    100,
    Math.round((transferValue / Math.max(transferTarget, 1)) * 100),
  );

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <div className="border-border bg-secondary rounded-[24px] border p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-foreground text-sm font-medium">Operations</div>
          <div className="bg-card text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-medium">
            {operationsPercent}%
          </div>
        </div>
        <div className="font-lato text-foreground text-[3rem] leading-none font-semibold tracking-[-0.05em]">
          {operationsValue}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">/{operationsTarget} target</p>
        <div className="mt-4 flex items-center gap-1.5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <span
              key={idx}
              className={cn(
                "h-8 w-3 rounded-full border",
                idx < Math.round((operationsPercent / 100) * 8)
                  ? "bg-primary border-transparent"
                  : "border-border bg-transparent",
              )}
            />
          ))}
        </div>
      </div>

      <div className="border-border bg-accent/20 rounded-[24px] border p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-foreground text-sm font-medium">Data Transfer</div>
          <div className="bg-card/80 text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-medium">
            {transferPercent}%
          </div>
        </div>
        <div className="font-lato text-foreground text-[3rem] leading-none font-semibold tracking-[-0.05em]">
          {transferValue}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          /{formatCompactNumber(transferVolume)} units
        </p>
        <div className="mt-4 flex items-center gap-1.5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <span
              key={idx}
              className={cn(
                "h-8 w-3 rounded-full border",
                idx < Math.round((transferPercent / 100) * 8)
                  ? "border-accent/50 bg-accent"
                  : "border-border bg-secondary/50",
              )}
            />
          ))}
        </div>
      </div>

      <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-[24px] p-4">
        <div className="bg-accent/35 absolute -top-10 -right-10 h-36 w-36 rounded-full blur-2xl" />
        <div className="relative">
          <div className="text-primary-foreground/60 text-[11px] tracking-[0.2em] uppercase">
            Automation
          </div>
          <h4 className="font-lato mt-2 max-w-[15ch] text-2xl leading-[1.05] font-semibold tracking-[-0.04em]">
            Take your automation to the next level
          </h4>
          <Button
            className="bg-primary-foreground text-primary hover:bg-primary-foreground mt-5 rounded-full px-4"
            onClick={onScenario}
          >
            Upgrade
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PortfolioMixChart({
  rows,
}: {
  rows: Array<{ label: string; value: number; width: string }>;
}) {
  if (!rows.length) {
    return <EmptyChartState message="No portfolio mix data yet." />;
  }

  const displayRows = [...rows];
  while (displayRows.length < 6) {
    displayRows.push({ label: `slot-${displayRows.length + 1}`, value: 0, width: "0%" });
  }

  return (
    <div className="border-border bg-secondary rounded-[24px] border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="space-y-1">
          <div className="font-lato text-foreground text-sm font-semibold">Statistics</div>
          <div className="text-muted-foreground flex items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1">
              <span className="bg-primary h-2 w-2 rounded-full" /> Operations
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="bg-accent h-2 w-2 rounded-full" /> Data transfer
            </span>
          </div>
        </div>
        <Badge
          variant="outline"
          className="border-border bg-card text-muted-foreground rounded-full px-3 py-1 text-xs"
        >
          2026
        </Badge>
      </div>

      <div className="grid grid-cols-6 items-end gap-3">
        {displayRows.map((row, index) => {
          if (row.value === 0) {
            return (
              <div key={row.label} className="space-y-2 text-center">
                <div className="border-border mx-auto h-44 w-10 rounded-full border border-dashed bg-transparent" />
                <div className="text-muted-foreground/50 text-[10px] tracking-[0.18em] uppercase">
                  -
                </div>
                <div className="text-muted-foreground/50 text-xs font-medium">0</div>
              </div>
            );
          }

          const percent = Number.parseInt(row.width, 10);
          const limeHeight = Math.max(8, Math.round(percent * 0.42));
          const darkHeight = Math.max(10, percent - limeHeight);

          return (
            <div key={row.label} className="space-y-2 text-center">
              <div className="border-border bg-muted mx-auto flex h-44 w-10 items-end rounded-full border p-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(14, percent)}%` }}
                  transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
                  className="relative w-full overflow-hidden rounded-full"
                >
                  <div
                    className="bg-accent absolute bottom-0 w-full"
                    style={{ height: `${limeHeight}%` }}
                  />
                  <div
                    className="bg-primary absolute top-0 w-full"
                    style={{ height: `${darkHeight}%` }}
                  />
                </motion.div>
              </div>
              <div className="text-muted-foreground text-[10px] tracking-[0.18em] uppercase">
                {row.label.slice(0, 6)}
              </div>
              <div className="text-foreground/70 text-xs font-medium">{row.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HighlightPanel({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-[28px] p-5">
      <div className="bg-radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_55%) absolute inset-y-0 right-0 w-1/2" />
      <div className="relative">
        <div className="text-primary-foreground/70 mb-3 flex items-center gap-2 text-xs tracking-[0.22em] uppercase">
          <Rocket className="h-4 w-4" />
          Scenario acceleration
        </div>
        <h3 className="font-lato max-w-[12ch] text-3xl leading-[1.02] font-semibold tracking-[-0.05em]">
          {title}
        </h3>
        <p className="text-primary-foreground/80 mt-3 max-w-sm text-sm leading-6">{description}</p>
        <Button
          className="bg-primary-foreground text-primary hover:bg-primary-foreground mt-6 rounded-full px-4"
          onClick={onAction}
        >
          {actionLabel}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function ActionCard({
  title,
  description,
  actionLabel,
  onClick,
  customAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onClick?: () => void;
  customAction?: ReactNode;
}) {
  return (
    <div className="border-border bg-secondary rounded-[24px] border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <h4 className="font-lato text-foreground text-sm font-semibold">{title}</h4>
      <p className="text-muted-foreground mt-1 text-sm leading-6">{description}</p>
      <div className="mt-4">
        {customAction ?? (
          <Button
            variant="outline"
            className="border-border bg-card rounded-full px-4"
            onClick={onClick}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="border-border bg-secondary text-muted-foreground rounded-[24px] border border-dashed p-6 text-sm">
      {message}
    </div>
  );
}
