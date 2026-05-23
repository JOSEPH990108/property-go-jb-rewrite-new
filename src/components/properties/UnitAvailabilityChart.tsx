"use client";

import { useState, useCallback } from "react";
import { Building2, Info, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectUnitChart } from "@/lib/unit-chart-data";
import {
  TowerGrid,
  UnitDetailPanel,
  type SelectedUnit,
} from "@/components/properties/unit-availability/UnitAvailabilityGrid";
import {
  UnitAvailabilitySummary,
  UnitStatusLegend,
} from "@/components/properties/unit-availability/UnitAvailabilityStatus";

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
