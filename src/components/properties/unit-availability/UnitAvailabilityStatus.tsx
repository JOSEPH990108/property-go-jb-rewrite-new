import { StatusBadge } from "@/components/shared/StatusBadge";
import type { TowerAvailability, UnitStatus } from "@/lib/unit-chart-data";
import type { ComponentProps } from "react";

type UnitStatusTone = NonNullable<ComponentProps<typeof StatusBadge>["tone"]>;

export const UNIT_STATUS_CELL_CLASS: Record<UnitStatus, string> = {
  available:
    "bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-800 cursor-pointer dark:bg-emerald-900/40 dark:hover:bg-emerald-800/60 dark:border-emerald-700 dark:text-emerald-200",
  reserved:
    "bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800 cursor-pointer dark:bg-amber-900/40 dark:hover:bg-amber-800/60 dark:border-amber-700 dark:text-amber-200",
  sold: "bg-rose-100 border-rose-300 text-rose-700 cursor-pointer dark:bg-rose-900/40 dark:border-rose-700 dark:text-rose-300",
};

export const UNIT_STATUS_SELECTED_RING_CLASS: Record<UnitStatus, string> = {
  available: "ring-2 ring-emerald-500 ring-offset-1",
  reserved: "ring-2 ring-amber-500 ring-offset-1",
  sold: "ring-2 ring-rose-500 ring-offset-1",
};

const UNIT_STATUS_BADGE_TONE: Record<UnitStatus, UnitStatusTone> = {
  available: "success",
  reserved: "warning",
  sold: "danger",
};

const UNIT_STATUS_LABEL: Record<UnitStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

const UNIT_STATUS_SUMMARY_CLASS: Record<UnitStatus, string> = {
  available: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
  reserved: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
  sold: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
};

export const UNIT_STATUS_ADMIN_CHIP_CLASS: Record<UnitStatus, string> = {
  available: "border-emerald-300/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  reserved: "border-amber-300/30 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  sold: "border-rose-300/30 bg-rose-500/10 text-rose-700 dark:text-rose-200",
};

export const UNIT_STATUS_ADMIN_NODE_CLASS: Record<UnitStatus, string> = {
  available:
    "border-emerald-300/30 bg-emerald-500/15 text-emerald-800 shadow-[0_0_16px_rgba(16,185,129,0.2)] dark:text-emerald-100 dark:shadow-[0_0_18px_rgba(52,211,153,0.28)]",
  reserved:
    "border-amber-300/30 bg-amber-500/15 text-amber-800 shadow-[0_0_16px_rgba(245,158,11,0.2)] dark:text-amber-100 dark:shadow-[0_0_18px_rgba(251,191,36,0.25)]",
  sold: "border-rose-300/30 bg-rose-500/15 text-rose-800 shadow-[0_0_16px_rgba(244,63,94,0.2)] dark:text-rose-100 dark:shadow-[0_0_18px_rgba(251,113,133,0.25)]",
};

const UNIT_STATUS_LEGEND_CLASS: Record<UnitStatus, string> = {
  available: "border-emerald-300 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/40",
  reserved: "border-amber-300 bg-amber-100 dark:border-amber-700 dark:bg-amber-900/40",
  sold: "border-rose-300 bg-rose-100 dark:border-rose-700 dark:bg-rose-900/40",
};

export const UNIT_STATUSES: UnitStatus[] = ["available", "reserved", "sold"];

export function getUnitStatusLabel(status: UnitStatus) {
  return UNIT_STATUS_LABEL[status];
}

export function UnitStatusBadge({ status }: { status: UnitStatus }) {
  return (
    <StatusBadge
      status={status}
      label={UNIT_STATUS_LABEL[status]}
      tone={UNIT_STATUS_BADGE_TONE[status]}
      className="mt-2 px-3 py-1 text-xs tracking-wide uppercase"
    />
  );
}

export function UnitStatusLegend() {
  return (
    <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-4 text-xs">
      {UNIT_STATUSES.map((status) => (
        <div key={status} className="flex items-center gap-1.5">
          <span className={`h-3 w-7 rounded border ${UNIT_STATUS_LEGEND_CLASS[status]}`} />
          {UNIT_STATUS_LABEL[status]}
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span className="border-border/40 bg-muted/20 h-3 w-7 rounded border border-dashed" />
        Void / Not applicable
      </div>
    </div>
  );
}

export function UnitAvailabilitySummary({ tower }: { tower: TowerAvailability }) {
  const counts = { available: 0, reserved: 0, sold: 0, total: 0 };

  for (const row of tower.floors) {
    if (row.kind !== "residential") continue;
    for (const cell of row.cells) {
      if (cell.kind !== "unit") continue;
      counts[cell.status]++;
      counts.total++;
    }
  }

  const pct = (count: number) => (counts.total ? Math.round((count / counts.total) * 100) : 0);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {UNIT_STATUSES.map((status) => (
        <span
          key={status}
          className={`rounded-full px-3 py-1 font-medium ${UNIT_STATUS_SUMMARY_CLASS[status]}`}
        >
          {counts[status]} {UNIT_STATUS_LABEL[status]} ({pct(counts[status])}%)
        </span>
      ))}
      <span className="border-border bg-background text-muted-foreground rounded-full border px-3 py-1">
        {counts.total} total units
      </span>
    </div>
  );
}
