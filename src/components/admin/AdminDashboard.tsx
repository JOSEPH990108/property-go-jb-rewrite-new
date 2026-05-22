"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, CalendarCheck2, CircleDollarSign, Users2 } from "lucide-react";
import { DynamicTower } from "@/components/admin/DynamicTower";
import { UnitModal } from "@/components/shared/UnitModal";
import { availabilityProjects, dashboardStats, type UnitRecord } from "@/lib/admin-mock-data";

const statIcons = [CalendarCheck2, Users2, CircleDollarSign, Activity];

export function AdminDashboard() {
  const [selectedUnit, setSelectedUnit] = useState<UnitRecord | null>(null);
  const [viewMode, setViewMode] = useState<"admin" | "customer">("admin");

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-border bg-gradient-to-br from-primary/12 via-card to-accent/10 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
          <p className="text-xs uppercase tracking-[0.28em] text-primary/80">Report system</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-foreground sm:text-4xl">
            Live unit availability, sales reporting, and admin action points in one visual deck.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/75">
            This dashboard follows the high-tech reference direction with glass surfaces, fast visual scanning, and a modal flow that can switch between internal admin controls and customer booking actions.
          </p>
        </div>

        <div className="rounded-[28px] border border-border bg-card/95 p-6 backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.24em] text-foreground/65">Modal preview mode</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["admin", "customer"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={
                  viewMode === mode
                    ? "rounded-2xl border border-primary/25 bg-primary/12 px-4 py-4 text-left text-foreground shadow-[0_0_24px_hsl(var(--primary)/0.18)]"
                    : "rounded-2xl border border-border bg-background px-4 py-4 text-left text-foreground/75"
                }
              >
                <p className="text-sm font-semibold capitalize">{mode} view</p>
                <p className="mt-1 text-xs text-foreground/65">
                  {mode === "admin"
                    ? "Shows update and edit actions for internal teams."
                    : "Shows booking CTA with disabled state for unavailable units."}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {dashboardStats.map((stat, index) => {
          const Icon = statIcons[index];

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-[26px] border border-border bg-card/95 p-5 backdrop-blur-md shadow-[0_18px_40px_rgba(15,23,42,0.1)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-foreground/70">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-foreground">{stat.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_22px_hsl(var(--primary)/0.16)]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-5 text-sm text-primary/80">{stat.delta}</p>
            </motion.div>
          );
        })}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary/80">Unit availability matrix</p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground">DynamicTower</h2>
            <p className="mt-1 text-sm text-foreground/70">
              Floors are grouped horizontally and each node is clickable to open the role-based unit modal.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <LegendChip label="Available" className="border-emerald-300/30 bg-emerald-400/14 text-emerald-800 dark:text-emerald-100" />
            <LegendChip label="Reserved" className="border-amber-300/30 bg-amber-400/14 text-amber-800 dark:text-amber-50" />
            <LegendChip label="Sold" className="border-rose-300/30 bg-rose-400/14 text-rose-800 dark:text-rose-50" />
          </div>
        </div>

        <DynamicTower projects={availabilityProjects} onUnitClick={setSelectedUnit} />
      </section>

      <UnitModal
        unitData={selectedUnit}
        viewMode={viewMode}
        open={selectedUnit !== null}
        onClose={() => setSelectedUnit(null)}
      />
    </div>
  );
}

function LegendChip({ label, className }: { label: string; className: string }) {
  return (
    <span className={`rounded-full border px-3 py-2 text-xs font-medium uppercase tracking-[0.22em] ${className}`}>
      {label}
    </span>
  );
}