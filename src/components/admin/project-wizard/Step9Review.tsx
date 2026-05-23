"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CreateFullProjectInput } from "@/app/actions/project-setup-actions";
import { SectionHeading } from "./WizardComponents";

type Props = {
  data: CreateFullProjectInput;
  onSubmit: () => void;
  isSubmitting: boolean;
};

function ReviewCard({ title, count, items }: { title: string; count: number; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
        <p className="text-sm font-semibold text-white">
          {title} <span className="text-white/40">({count})</span>
        </p>
      </div>
      {items.length > 0 && (
        <ul className="space-y-0.5">
          {items.slice(0, 8).map((item, i) => (
            <li key={i} className="truncate text-xs text-white/50">
              • {item}
            </li>
          ))}
          {items.length > 8 && (
            <li className="text-xs text-white/40">…and {items.length - 8} more</li>
          )}
        </ul>
      )}
    </div>
  );
}

export function Step9Review({ data, onSubmit, isSubmitting }: Props) {
  const {
    project,
    phases,
    towers,
    layouts,
    facingGroups,
    stacks,
    specialFloors,
    salesPackages,
    nearbyPlaces,
    pricingSnapshots,
  } = data;

  return (
    <div>
      <SectionHeading
        title="Review & Create"
        subtitle="Review the data below, then click Create Project to save everything to the database."
      />

      {/* Project summary banner */}
      <div className="border-primary/30 bg-primary/10 mb-6 rounded-xl border p-4">
        <p className="text-primary text-sm font-semibold">{project.name || "(unnamed)"}</p>
        <p className="mt-1 text-xs text-white/60">
          Slug: <span className="font-mono text-white/80">{project.slug || "—"}</span> &nbsp;·&nbsp;
          {project.totalUnits ? `${project.totalUnits} total units` : "units TBD"} &nbsp;·&nbsp;
          Launch {project.launchYear || "—"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ReviewCard
          title="Phases"
          count={phases.length}
          items={phases.map((p) => `${p.phaseCode ? `[${p.phaseCode}] ` : ""}${p.name}`)}
        />
        <ReviewCard
          title="Towers"
          count={towers.length}
          items={towers.map(
            (t) =>
              `${t.towerNumber} — ${t.floorCount || "?"} floors (${t.floorMin || "?"}–${t.floorMax || "?"})`,
          )}
        />
        <ReviewCard
          title="Layouts"
          count={layouts.length}
          items={layouts.map(
            (l) =>
              `${l.code} — ${l.builtUpSqft} sqft, ${l.bedrooms}br${l.isDualKey ? " (DK)" : ""}`,
          )}
        />
        <ReviewCard
          title="Facing Groups"
          count={facingGroups.length}
          items={facingGroups.map((fg) => `${fg.towerNumber} / ${fg.key}: ${fg.label}`)}
        />
        <ReviewCard
          title="Stacks"
          count={stacks.length}
          items={stacks.map((s) => `${s.towerNumber} / Stack ${s.stackNo} → ${s.layoutCode}`)}
        />
        <ReviewCard
          title="Special Floors"
          count={specialFloors.length}
          items={specialFloors.map(
            (sf) => `${sf.towerNumber} / ${sf.floorLabel} (${sf.floorKind})`,
          )}
        />
        <ReviewCard
          title="Sales Packages"
          count={salesPackages.length}
          items={salesPackages.map(
            (p) => `${p.name}${p.rebatePercentage ? ` (${p.rebatePercentage}%)` : ""}`,
          )}
        />
        <ReviewCard
          title="Nearby Places"
          count={nearbyPlaces.length}
          items={nearbyPlaces.map(
            (p) => `${p.category}: ${p.name} ${p.distanceKm ? `(${p.distanceKm}km)` : ""}`,
          )}
        />
        <ReviewCard
          title="Pricing Snapshots"
          count={pricingSnapshots.length}
          items={pricingSnapshots.map(
            (s) =>
              `${s.layoutCode} / ${s.towerNumber} — SPA ${s.spaPriceMin ? `RM${Number(s.spaPriceMin).toLocaleString()}` : "TBD"}`,
          )}
        />
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={isSubmitting || !project.slug || !project.name}
          className="bg-primary hover:bg-primary/90 min-w-[180px] text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            "Create Project"
          )}
        </Button>
      </div>
    </div>
  );
}
