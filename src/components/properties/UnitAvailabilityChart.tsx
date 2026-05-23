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
import {
  getUnitStatusLabel,
  UnitAvailabilitySummary,
  UNIT_STATUS_CELL_CLASS,
  UNIT_STATUS_SELECTED_RING_CLASS,
  UnitStatusBadge,
  UnitStatusLegend,
} from "@/components/properties/unit-availability/UnitAvailabilityStatus";

// ─── Constants ──────────────────────────────────────────────────────────────

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
        <div className="border-border/40 bg-muted/20 text-muted-foreground/50 flex h-9 w-14 items-center justify-center rounded border border-dashed text-[9px] tracking-widest uppercase">
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
        title={`${cell.unitNo} · ${getUnitStatusLabel(cell.status)} · ${cell.sqft.toLocaleString()} sqft`}
        className={cn(
          "flex h-9 w-14 flex-col items-start justify-center overflow-hidden rounded border px-1.5 transition-all duration-150",
          UNIT_STATUS_CELL_CLASS[cell.status],
          isSelected && UNIT_STATUS_SELECTED_RING_CLASS[cell.status],
        )}
      >
        <span className="block truncate text-[9px] leading-none font-semibold tracking-tight">
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
    <div className="border-border overflow-x-auto rounded-xl border">
      <table className="border-collapse text-xs" style={{ minWidth: "max-content" }}>
        <thead className="sticky top-0 z-20">
          {/* Row 1 — Facing group headers */}
          <tr>
            <th className="border-border bg-card text-muted-foreground sticky left-0 z-30 min-w-[72px] border-r border-b px-3 py-2 text-left text-[10px] tracking-[0.2em] whitespace-nowrap uppercase">
              Floor
            </th>
            {tower.facingGroups.map((group, gi) => (
              <th
                key={group.key}
                colSpan={group.stackCount}
                className={cn(
                  "border-border text-foreground/80 border-r border-b px-2 py-2 text-center text-[10px] font-semibold tracking-wide uppercase last:border-r-0",
                  FACING_GROUP_COLOURS[gi % FACING_GROUP_COLOURS.length],
                )}
              >
                {group.label}
              </th>
            ))}
          </tr>

          {/* Row 2 — Stack type + sqft sub-headers */}
          <tr>
            <th className="border-border bg-card text-muted-foreground/70 sticky left-0 z-30 border-r border-b px-3 py-1 text-left text-[9px]">
              Unit No.
            </th>
            {tower.stacks.map((stack) => {
              const groupIdx = tower.facingGroups.findIndex(
                (fg) => fg.key === stack.facingGroupKey,
              );
              return (
                <th
                  key={stack.stackNo}
                  className={cn(
                    "border-border border-r border-b px-1 py-1 text-center last:border-r-0",
                    FACING_GROUP_COLOURS[groupIdx % FACING_GROUP_COLOURS.length],
                  )}
                >
                  <div className="text-foreground/80 text-[9px] font-semibold">
                    {stack.layoutType}
                  </div>
                  <div className="text-muted-foreground text-[8px]">
                    {stack.sqft.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground/60 mt-0.5 text-[8px] font-medium">
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
        <td className="border-border sticky left-0 z-10 border-r border-b bg-slate-100 px-3 py-1.5 text-[10px] font-semibold tracking-widest text-slate-500 uppercase dark:bg-slate-800 dark:text-slate-400">
          {row.floorLabel}
        </td>
        <td
          colSpan={totalCols}
          className="border-border border-b px-4 py-1.5 text-center text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase dark:text-slate-500"
        >
          ■ ■ ■ &nbsp; MECHANICAL / BREAK TANK &nbsp; ■ ■ ■
        </td>
      </tr>
    );
  }

  if (row.kind === "facility") {
    return (
      <tr className="bg-blue-50/60 dark:bg-blue-950/20">
        <td className="border-border sticky left-0 z-10 border-r border-b bg-blue-50 px-3 py-1.5 text-[10px] font-semibold tracking-wider text-blue-600 uppercase dark:bg-blue-950/30 dark:text-blue-400">
          {row.floorLabel}
        </td>
        <td
          colSpan={totalCols}
          className="border-border border-b px-4 py-1.5 text-center text-[10px] font-semibold tracking-[0.25em] text-blue-500 uppercase dark:text-blue-400"
        >
          {row.facilityLabel}
        </td>
      </tr>
    );
  }

  // Residential floor row
  return (
    <tr className="group hover:bg-muted/20">
      <td className="border-border bg-card text-muted-foreground group-hover:bg-muted/40 sticky left-0 z-10 border-r border-b px-3 py-0.5 text-[11px] font-medium">
        {row.floorLabel}
      </td>
      {row.cells.map((cell, ci) => {
        const isSelected =
          selectedUnit !== null && cell.kind === "unit" && cell.unitNo === selectedUnit.unitNo;

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

function UnitDetailPanel({ unit, onClose }: { unit: SelectedUnit; onClose: () => void }) {
  return (
    <div className="border-border bg-card mt-4 rounded-2xl border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-primary/80 text-xs tracking-[0.2em] uppercase">
            {unit.towerName} · Floor {unit.floor}
          </p>
          <h4 className="text-foreground mt-1 text-2xl font-semibold">Unit {unit.unitNo}</h4>
          <UnitStatusBadge status={unit.status} />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="border-border bg-background text-foreground hover:bg-muted/30 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="border-border bg-background rounded-lg border p-3">
          <p className="text-muted-foreground text-[10px] tracking-widest uppercase">Layout</p>
          <p className="text-foreground mt-1 text-base font-semibold">{unit.layoutType}</p>
        </div>
        <div className="border-border bg-background rounded-lg border p-3">
          <p className="text-muted-foreground text-[10px] tracking-widest uppercase">Built-up</p>
          <p className="text-foreground mt-1 text-base font-semibold">
            {unit.sqft.toLocaleString()} sqft
          </p>
        </div>
        <div className="border-border bg-background rounded-lg border p-3">
          <p className="text-muted-foreground text-[10px] tracking-widest uppercase">Floor</p>
          <p className="text-foreground mt-1 text-base font-semibold">{unit.floor}</p>
        </div>
        <div className="border-border bg-background rounded-lg border p-3">
          <p className="text-muted-foreground text-[10px] tracking-widest uppercase">From</p>
          <p className="text-primary mt-1 text-base font-semibold">{formatPrice(unit.price)}</p>
        </div>
      </div>

      {unit.status === "available" && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm"
          >
            Book a Viewing
          </button>
          <button
            type="button"
            className="border-border bg-background text-foreground hover:bg-muted/30 inline-flex h-10 items-center gap-2 rounded-xl border px-5 text-sm font-medium"
          >
            Request Info
          </button>
        </div>
      )}
      {unit.status !== "available" && (
        <div className="mt-4">
          <button
            type="button"
            className="border-border bg-background text-foreground hover:bg-muted/30 inline-flex h-10 items-center gap-2 rounded-xl border px-5 text-sm font-medium"
          >
            Contact Agent
          </button>
        </div>
      )}
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
    <section className="border-border bg-card/95 rounded-2xl border p-5 shadow-sm">
      {/* Header */}
      <div className="border-border flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-primary/80 text-xs tracking-[0.22em] uppercase">Live Availability</p>
          <h2 className="text-foreground mt-1 text-2xl font-semibold">Unit Availability</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
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
            className="border-border bg-background text-foreground hover:bg-muted/30 inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium"
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
                      : "border-border bg-background text-foreground hover:bg-muted/30",
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
            <UnitAvailabilitySummary tower={activeTower} />
          </div>

          {/* Legend */}
          <UnitStatusLegend />

          {/* Hint for horizontal scroll on mobile */}
          <p className="text-muted-foreground/60 mt-2 text-[10px] italic sm:hidden">
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
