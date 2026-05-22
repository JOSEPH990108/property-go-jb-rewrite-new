"use client";

import { useState, useCallback } from "react";
import { Building2, X, Info, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import type {
  ProjectUnitChart,
  TowerAvailability,
  UnitCell,
  FloorRow,
  UnitStatus,
} from "@/lib/unit-chart-data";

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_CELL: Record<UnitStatus, string> = {
  available:
    "bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-800 cursor-pointer dark:bg-emerald-900/40 dark:hover:bg-emerald-800/60 dark:border-emerald-700 dark:text-emerald-200",
  reserved:
    "bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800 cursor-pointer dark:bg-amber-900/40 dark:hover:bg-amber-800/60 dark:border-amber-700 dark:text-amber-200",
  sold: "bg-rose-100 border-rose-300 text-rose-700 cursor-pointer dark:bg-rose-900/40 dark:border-rose-700 dark:text-rose-300",
};

const STATUS_SELECTED_RING: Record<UnitStatus, string> = {
  available: "ring-2 ring-emerald-500 ring-offset-1",
  reserved: "ring-2 ring-amber-500 ring-offset-1",
  sold: "ring-2 ring-rose-500 ring-offset-1",
};

const STATUS_BADGE: Record<UnitStatus, string> = {
  available: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200",
  reserved: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200",
  sold: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
};

const STATUS_LABEL: Record<UnitStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

// Unique facing-group colours for the header band
const FACING_GROUP_COLOURS = [
  "bg-sky-100/70 dark:bg-sky-900/30",
  "bg-violet-100/70 dark:bg-violet-900/30",
  "bg-teal-100/70 dark:bg-teal-900/30",
  "bg-orange-100/70 dark:bg-orange-900/30",
  "bg-pink-100/70 dark:bg-pink-900/30",
];

// ─── Types ───────────────────────────────────────────────────────────────────

type SelectedUnit = {
  unitNo: string;
  towerName: string;
  floor: number;
  status: UnitStatus;
  sqft: number;
  price: number;
  facing: string;
  layoutType: string;
};


// ─── Unit cell button ────────────────────────────────────────────────────────

function UnitButton({
  cell,
  isSelected,
  onClick,
}: {
  cell: UnitCell;
  isSelected: boolean;
  onClick: () => void;
}) {
  if (cell.kind === "void") {
    return (
      <td className="p-0.5">
        <div className="flex h-9 w-14 items-center justify-center rounded border border-dashed border-border/40 bg-muted/20 text-[9px] uppercase tracking-widest text-muted-foreground/50">
          void
        </div>
      </td>
    );
  }

  return (
    <td className="p-0.5">
      <button
        type="button"
        onClick={onClick}
        title={`${cell.unitNo} · ${STATUS_LABEL[cell.status]} · ${cell.sqft.toLocaleString()} sqft`}
        className={cn(
          "flex h-9 w-14 flex-col items-start justify-center overflow-hidden rounded border px-1.5 transition-all duration-150",
          STATUS_CELL[cell.status],
          isSelected && STATUS_SELECTED_RING[cell.status]
        )}
      >
        <span className="block truncate text-[9px] font-semibold leading-none tracking-tight">
          {cell.unitNo}
        </span>
        <span className="mt-0.5 block truncate text-[8px] leading-none opacity-70">
          {cell.layoutType}
        </span>
      </button>
    </td>
  );
}

// ─── Tower grid ──────────────────────────────────────────────────────────────

function TowerGrid({
  tower,
  selectedUnit,
  onUnitClick,
}: {
  tower: TowerAvailability;
  selectedUnit: SelectedUnit | null;
  onUnitClick: (unit: SelectedUnit) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="border-collapse text-xs" style={{ minWidth: "max-content" }}>
        <thead className="sticky top-0 z-20">
          {/* Row 1 — Facing group headers */}
          <tr>
            <th className="sticky left-0 z-30 min-w-[72px] whitespace-nowrap border-b border-r border-border bg-card px-3 py-2 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Floor
            </th>
            {tower.facingGroups.map((group, gi) => (
              <th
                key={group.key}
                colSpan={group.stackCount}
                className={cn(
                  "border-b border-r border-border px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-foreground/80 last:border-r-0",
                  FACING_GROUP_COLOURS[gi % FACING_GROUP_COLOURS.length]
                )}
              >
                {group.label}
              </th>
            ))}
          </tr>

          {/* Row 2 — Stack type + sqft sub-headers */}
          <tr>
            <th className="sticky left-0 z-30 border-b border-r border-border bg-card px-3 py-1 text-left text-[9px] text-muted-foreground/70">
              Unit No.
            </th>
            {tower.stacks.map((stack, gi) => {
              const groupIdx = tower.facingGroups.findIndex((fg) => fg.key === stack.facingGroupKey);
              return (
                <th
                  key={stack.stackNo}
                  className={cn(
                    "border-b border-r border-border px-1 py-1 text-center last:border-r-0",
                    FACING_GROUP_COLOURS[groupIdx % FACING_GROUP_COLOURS.length]
                  )}
                >
                  <div className="text-[9px] font-semibold text-foreground/80">{stack.layoutType}</div>
                  <div className="text-[8px] text-muted-foreground">{stack.sqft.toLocaleString()}</div>
                  <div className="mt-0.5 text-[8px] font-medium text-muted-foreground/60">
                    {stack.stackNo}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {tower.floors.map((row, rowIdx) => (
            <FloorRowElement
              key={rowIdx}
              row={row}
              tower={tower}
              selectedUnit={selectedUnit}
              onUnitClick={onUnitClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Single floor row ────────────────────────────────────────────────────────

function FloorRowElement({
  row,
  tower,
  selectedUnit,
  onUnitClick,
}: {
  row: FloorRow;
  tower: TowerAvailability;
  selectedUnit: SelectedUnit | null;
  onUnitClick: (unit: SelectedUnit) => void;
}) {
  const totalCols = tower.stacks.length;

  if (row.kind === "breaktank") {
    return (
      <tr className="bg-slate-100/80 dark:bg-slate-800/40">
        <td className="sticky left-0 z-10 border-b border-r border-border bg-slate-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {row.floorLabel}
        </td>
        <td
          colSpan={totalCols}
          className="border-b border-border px-4 py-1.5 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500"
        >
          ■ ■ ■ &nbsp; MECHANICAL / BREAK TANK &nbsp; ■ ■ ■
        </td>
      </tr>
    );
  }

  if (row.kind === "facility") {
    return (
      <tr className="bg-blue-50/60 dark:bg-blue-950/20">
        <td className="sticky left-0 z-10 border-b border-r border-border bg-blue-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
          {row.floorLabel}
        </td>
        <td
          colSpan={totalCols}
          className="border-b border-border px-4 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-500 dark:text-blue-400"
        >
          {row.facilityLabel}
        </td>
      </tr>
    );
  }

  // Residential floor row
  return (
    <tr className="group hover:bg-muted/20">
      <td className="sticky left-0 z-10 border-b border-r border-border bg-card px-3 py-0.5 text-[11px] font-medium text-muted-foreground group-hover:bg-muted/40">
        {row.floorLabel}
      </td>
      {row.cells.map((cell, ci) => {
        const isSelected =
          selectedUnit !== null &&
          cell.kind === "unit" &&
          cell.unitNo === selectedUnit.unitNo;

        return (
          <UnitButton
            key={ci}
            cell={cell}
            isSelected={isSelected}
            onClick={() => {
              if (cell.kind !== "unit") return;
              onUnitClick({
                unitNo: cell.unitNo,
                towerName: tower.towerName,
                floor: row.floor,
                status: cell.status,
                sqft: cell.sqft,
                price: cell.price,
                facing: cell.facing,
                layoutType: cell.layoutType,
              });
            }}
          />
        );
      })}
    </tr>
  );
}

// ─── Unit detail panel ───────────────────────────────────────────────────────

function UnitDetailPanel({
  unit,
  onClose,
}: {
  unit: SelectedUnit;
  onClose: () => void;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
            {unit.towerName} · Floor {unit.floor}
          </p>
          <h4 className="mt-1 text-2xl font-semibold text-foreground">
            Unit {unit.unitNo}
          </h4>
          <span
            className={cn(
              "mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
              STATUS_BADGE[unit.status]
            )}
          >
            {STATUS_LABEL[unit.status]}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-muted/30"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Layout</p>
          <p className="mt-1 text-base font-semibold text-foreground">{unit.layoutType}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Built-up</p>
          <p className="mt-1 text-base font-semibold text-foreground">
            {unit.sqft.toLocaleString()} sqft
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Floor</p>
          <p className="mt-1 text-base font-semibold text-foreground">{unit.floor}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">From</p>
          <p className="mt-1 text-base font-semibold text-primary">{formatPrice(unit.price)}</p>
        </div>
      </div>

      {unit.status === "available" && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Book a Viewing
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-medium text-foreground hover:bg-muted/30"
          >
            Request Info
          </button>
        </div>
      )}
      {unit.status !== "available" && (
        <div className="mt-4">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-medium text-foreground hover:bg-muted/30"
          >
            Contact Agent
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Availability summary bar ─────────────────────────────────────────────────

function AvailabilitySummary({ tower }: { tower: TowerAvailability }) {
  const counts = { available: 0, reserved: 0, sold: 0, total: 0 };
  for (const row of tower.floors) {
    if (row.kind !== "residential") continue;
    for (const cell of row.cells) {
      if (cell.kind !== "unit") continue;
      counts[cell.status]++;
      counts.total++;
    }
  }

  const pct = (n: number) => (counts.total ? Math.round((n / counts.total) * 100) : 0);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
        {counts.available} Available ({pct(counts.available)}%)
      </span>
      <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
        {counts.reserved} Reserved ({pct(counts.reserved)}%)
      </span>
      <span className="rounded-full bg-rose-100 px-3 py-1 font-medium text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
        {counts.sold} Sold ({pct(counts.sold)}%)
      </span>
      <span className="rounded-full border border-border bg-background px-3 py-1 text-muted-foreground">
        {counts.total} total units
      </span>
    </div>
  );
}

// ─── Main chart component ────────────────────────────────────────────────────

export function UnitAvailabilityChart({ data }: { data: ProjectUnitChart }) {
  const [activeTowerId, setActiveTowerId] = useState(data.towers[0]?.towerId ?? "");
  const [selectedUnit, setSelectedUnit] = useState<SelectedUnit | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const activeTower = data.towers.find((t) => t.towerId === activeTowerId) ?? data.towers[0];

  const handleUnitClick = useCallback((unit: SelectedUnit) => {
    setSelectedUnit((prev) => (prev?.unitNo === unit.unitNo ? null : unit));
  }, []);

  if (!activeTower) return null;

  return (
    <section className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-primary/80">Live Availability</p>
          <h2 className="mt-1 text-2xl font-semibold text-foreground">Unit Availability</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Click any unit cell to see details and pricing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!data.isLiveData && (
            <div className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <Info className="h-3 w-3" />
              Demo data
            </div>
          )}
          {data.isLiveData && (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live data
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted/30"
          >
            {collapsed ? (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Show chart
              </>
            ) : (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Collapse
              </>
            )}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Tower tabs */}
          {data.towers.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.towers.map((tower) => (
                <button
                  key={tower.towerId}
                  type="button"
                  onClick={() => {
                    setActiveTowerId(tower.towerId);
                    setSelectedUnit(null);
                  }}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all",
                    tower.towerId === activeTowerId
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:bg-muted/30"
                  )}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  {tower.towerName}
                </button>
              ))}
            </div>
          )}

          {/* Availability summary */}
          <div className="mt-3">
            <AvailabilitySummary tower={activeTower} />
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-7 rounded border border-emerald-300 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/40" />
              Available
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-7 rounded border border-amber-300 bg-amber-100 dark:border-amber-700 dark:bg-amber-900/40" />
              Reserved
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-7 rounded border border-rose-300 bg-rose-100 dark:border-rose-700 dark:bg-rose-900/40" />
              Sold
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-7 rounded border border-dashed border-border/40 bg-muted/20" />
              Void / Not applicable
            </div>
          </div>

          {/* Hint for horizontal scroll on mobile */}
          <p className="mt-2 text-[10px] italic text-muted-foreground/60 sm:hidden">
            Scroll horizontally to see all unit stacks →
          </p>

          {/* Grid */}
          <div className="mt-4">
            <TowerGrid
              tower={activeTower}
              selectedUnit={selectedUnit}
              onUnitClick={handleUnitClick}
            />
          </div>

          {/* Unit detail panel */}
          {selectedUnit && (
            <UnitDetailPanel unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
          )}
        </>
      )}
    </section>
  );
}
