"use client";

import { motion } from "framer-motion";
import { Building2, Layers3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AvailabilityProject, UnitRecord, UnitStatus } from "@/lib/admin-mock-data";

type DynamicTowerProps = {
  projects: AvailabilityProject[];
  onUnitClick: (unit: UnitRecord) => void;
};

const statusStyles: Record<UnitStatus, string> = {
  available:
    "border-emerald-300/30 bg-emerald-400/20 text-emerald-900 dark:text-emerald-100 shadow-[0_0_18px_rgba(52,211,153,0.28)] hover:shadow-[0_0_28px_rgba(52,211,153,0.45)]",
  reserved:
    "border-amber-300/30 bg-amber-400/20 text-amber-900 dark:text-amber-50 shadow-[0_0_18px_rgba(251,191,36,0.25)] hover:shadow-[0_0_28px_rgba(251,191,36,0.42)]",
  sold: "border-rose-300/30 bg-rose-400/18 text-rose-900 dark:text-rose-50 shadow-[0_0_18px_rgba(251,113,133,0.25)] hover:shadow-[0_0_28px_rgba(251,113,133,0.4)]",
};

function groupByFloor(units: UnitRecord[]) {
  const grouped = new Map<number, UnitRecord[]>();

  for (const unit of units) {
    const existing = grouped.get(unit.floor) ?? [];
    existing.push(unit);
    grouped.set(unit.floor, existing);
  }

  return Array.from(grouped.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([floor, floorUnits]) => ({
      floor,
      units: floorUnits.sort((a, b) => a.unitId.localeCompare(b.unitId)),
    }));
}

export function DynamicTower({ projects, onUnitClick }: DynamicTowerProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {projects.map((project) => {
        const groupedFloors = groupByFloor(project.units);
        const availableCount = project.units.filter((unit) => unit.status === "available").length;

        return (
          <section
            key={project.name}
            className="border-border bg-card/95 rounded-[28px] border p-5 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur-md"
          >
            <div className="border-border flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-primary/80 text-xs tracking-[0.22em] uppercase">
                  Live project matrix
                </p>
                <h3 className="text-foreground mt-2 text-2xl font-semibold">{project.name}</h3>
                <p className="text-foreground/70 mt-1 text-sm">{project.description}</p>
              </div>

              <div className="border-border bg-background text-foreground flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm">
                <Building2 className="text-primary h-4 w-4" />
                <span>{project.units.length} units tracked</span>
                <span className="bg-foreground/30 h-1 w-1 rounded-full" />
                <span>{availableCount} available</span>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {groupedFloors.map((floorRow) => (
                <div
                  key={floorRow.floor}
                  className="grid gap-3 lg:grid-cols-[92px_1fr] lg:items-center"
                >
                  <div className="border-border bg-background text-foreground/75 flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm">
                    <Layers3 className="text-primary h-4 w-4" />
                    <span>Floor {floorRow.floor}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                    {floorRow.units.map((unit) => (
                      <motion.button
                        key={unit.unitId}
                        type="button"
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onUnitClick(unit)}
                        className={cn(
                          "aspect-square rounded-2xl border p-2 text-left transition",
                          statusStyles[unit.status],
                        )}
                      >
                        <span className="block text-[11px] tracking-[0.2em] text-current/70 uppercase">
                          {unit.status}
                        </span>
                        <span className="mt-3 block text-sm font-semibold text-current">
                          {unit.unitId}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
