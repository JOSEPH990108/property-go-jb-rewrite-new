"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, RefreshCcw, RotateCcw } from "lucide-react";
import { UnitModal } from "@/components/shared/UnitModal";
import {
  getUnitStatusLabel,
  UNIT_STATUSES,
  UNIT_STATUS_ADMIN_CHIP_CLASS,
  UNIT_STATUS_ADMIN_NODE_CLASS,
} from "@/components/properties/unit-availability/UnitAvailabilityStatus";
import {
  deepCloneProjects,
  randomizeProjectStatuses,
  unitLayoutProjects,
  type UnitNode,
} from "@/lib/unit-layout-data";
import type { UnitRecord } from "@/lib/admin-mock-data";
import { cn } from "@/lib/utils";

export default function AdminUnitsPage() {
  const [projectsData, setProjectsData] = useState(() => deepCloneProjects(unitLayoutProjects));
  const [selectedProjectSlug, setSelectedProjectSlug] = useState(projectsData[0]?.slug ?? "");
  const [selectedTowerId, setSelectedTowerId] = useState("all");
  const [selectedUnitRecord, setSelectedUnitRecord] = useState<UnitRecord | null>(null);

  const selectedProject = useMemo(
    () => projectsData.find((project) => project.slug === selectedProjectSlug) ?? projectsData[0],
    [projectsData, selectedProjectSlug],
  );

  const visibleTowers = useMemo(() => {
    if (!selectedProject) return [];
    if (selectedTowerId === "all") return selectedProject.towers;
    return selectedProject.towers.filter((tower) => tower.towerId === selectedTowerId);
  }, [selectedProject, selectedTowerId]);

  const totals = useMemo(() => {
    if (!selectedProject) {
      return { available: 0, reserved: 0, sold: 0, units: 0 };
    }

    const counts = { available: 0, reserved: 0, sold: 0, units: 0 };

    for (const tower of selectedProject.towers) {
      for (const floor of tower.floors) {
        for (const unit of floor.units) {
          counts[unit.status] += 1;
          counts.units += 1;
        }
      }
    }

    return counts;
  }, [selectedProject]);

  const refreshSelectedProject = () => {
    if (!selectedProject) return;

    setProjectsData((prev) =>
      prev.map((project) =>
        project.slug === selectedProject.slug ? randomizeProjectStatuses(project) : project,
      ),
    );
  };

  const resetAllProjects = () => {
    setProjectsData(deepCloneProjects(unitLayoutProjects));
    setSelectedTowerId("all");
    setSelectedUnitRecord(null);
  };

  const onUnitClick = (towerLabel: string, floor: number, unit: UnitNode) => {
    if (!selectedProject) return;

    setSelectedUnitRecord({
      projectName: `${selectedProject.name} - ${towerLabel}`,
      unitId: unit.unitCode,
      floor,
      status: unit.status,
      lotSize: unit.lotSize,
      facing: unit.facing,
      spaPrice: unit.spaPrice,
    });
  };

  if (!selectedProject) {
    return (
      <section className="border-border bg-card/95 rounded-[28px] border p-6">
        <h2 className="text-foreground text-2xl font-semibold">Unit Management</h2>
        <p className="text-foreground/70 mt-3 text-sm">No project data available.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="border-border bg-card/95 rounded-[28px] border p-5 shadow-[0_20px_60px_rgba(15,23,42,0.1)]">
        <div className="border-border flex flex-col gap-4 border-b pb-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-primary/80 text-xs tracking-[0.24em] uppercase">Unit page</p>
            <h2 className="text-foreground mt-2 text-3xl font-semibold">
              Project Unit Control Center
            </h2>
            <p className="text-foreground/70 mt-2 text-sm">
              Select a project and tower, then refresh live statuses to simulate incoming
              availability updates.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[220px_220px_auto_auto]">
            <label className="text-foreground/75 text-sm font-medium">
              Project
              <select
                value={selectedProjectSlug}
                onChange={(event) => {
                  setSelectedProjectSlug(event.target.value);
                  setSelectedTowerId("all");
                }}
                className="border-border bg-background text-foreground mt-2 h-11 w-full rounded-xl border px-3 text-sm"
              >
                {projectsData.map((project) => (
                  <option key={project.slug} value={project.slug}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-foreground/75 text-sm font-medium">
              Tower
              <select
                value={selectedTowerId}
                onChange={(event) => setSelectedTowerId(event.target.value)}
                className="border-border bg-background text-foreground mt-2 h-11 w-full rounded-xl border px-3 text-sm"
              >
                <option value="all">All Towers</option>
                {selectedProject.towers.map((tower) => (
                  <option key={tower.towerId} value={tower.towerId}>
                    {tower.towerLabel}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={refreshSelectedProject}
              className="border-primary/20 bg-primary/12 text-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh Units
            </button>

            <button
              type="button"
              onClick={resetAllProjects}
              className="border-border bg-background text-foreground inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Data
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="border-border bg-background text-foreground/70 rounded-full border px-3 py-1.5 text-xs font-medium tracking-[0.2em] uppercase">
            {selectedProject.location}
          </span>
          <span className="border-border bg-background text-foreground/70 rounded-full border px-3 py-1.5 text-xs font-medium tracking-[0.2em] uppercase">
            {totals.units} units
          </span>
          {UNIT_STATUSES.map((status) => (
            <span
              key={status}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium tracking-[0.2em] uppercase",
                UNIT_STATUS_ADMIN_CHIP_CLASS[status],
              )}
            >
              {totals[status]} {getUnitStatusLabel(status).toLowerCase()}
            </span>
          ))}
        </div>

        <div className="border-border bg-background mt-4 rounded-2xl border p-4">
          <p className="text-foreground/80 text-sm">
            <span className="font-semibold">Data source note:</span>{" "}
            {selectedProject.source.verifiedTowerBreakdown
              ? "Tower breakdown verified from public source."
              : "Tower/unit breakdown currently modeled for UI workflow testing."}
          </p>
          <ul className="text-foreground/70 mt-2 list-disc space-y-1 pl-5 text-sm">
            {selectedProject.source.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {visibleTowers.map((tower) => (
            <motion.article
              key={tower.towerId}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="border-border bg-card/95 rounded-[26px] border p-5"
            >
              <div className="border-border flex items-center justify-between gap-3 border-b pb-4">
                <div>
                  <p className="text-primary/80 text-xs tracking-[0.22em] uppercase">
                    Tower design
                  </p>
                  <h3 className="text-foreground mt-2 text-2xl font-semibold">
                    {tower.towerLabel}
                  </h3>
                </div>

                <div className="border-border bg-background text-foreground/75 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                  <Building2 className="text-primary h-4 w-4" />
                  {tower.floors.length} floors
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {tower.floors.map((floorRow) => (
                  <div
                    key={`${tower.towerId}-${floorRow.floor}`}
                    className="grid gap-2 lg:grid-cols-[92px_1fr] lg:items-center"
                  >
                    <div className="border-border bg-background text-foreground/70 rounded-xl border px-3 py-2 text-xs font-medium tracking-[0.2em] uppercase">
                      Floor {floorRow.floor}
                    </div>

                    <div
                      className={cn(
                        "grid gap-2",
                        floorRow.units.length <= 5
                          ? "grid-cols-5"
                          : floorRow.units.length === 6
                            ? "grid-cols-3 sm:grid-cols-6"
                            : "grid-cols-4 sm:grid-cols-7",
                      )}
                    >
                      {floorRow.units.map((unit) => (
                        <button
                          key={unit.unitCode}
                          type="button"
                          onClick={() => onUnitClick(tower.towerLabel, floorRow.floor, unit)}
                          className={cn(
                            "aspect-square rounded-xl border p-1.5 text-left transition hover:-translate-y-0.5",
                            UNIT_STATUS_ADMIN_NODE_CLASS[unit.status],
                          )}
                        >
                          <span className="block text-[10px] tracking-[0.15em] uppercase opacity-75">
                            {getUnitStatusLabel(unit.status)}
                          </span>
                          <span className="mt-2 block text-[11px] leading-4 font-semibold">
                            {unit.unitCode}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </section>

      <UnitModal
        unitData={selectedUnitRecord}
        viewMode="admin"
        open={selectedUnitRecord !== null}
        onClose={() => setSelectedUnitRecord(null)}
      />
    </div>
  );
}
