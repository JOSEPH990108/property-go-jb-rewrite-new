import type { Metadata } from "next";
import { UnitAvailabilityChart } from "@/components/properties/UnitAvailabilityChart";
import { DEMO_PROJECT } from "@/lib/unit-chart-data";

export const metadata: Metadata = {
  title: "Unit Availability Chart Demo | PropertyGoJB",
  description: "Interactive unit availability chart demonstrating Tower B and Tower C floor plans.",
  robots: { index: false },
};

export default function UnitChartDemoPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Page header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container py-8">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-primary/80">
            Demo · Unit Availability
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            {DEMO_PROJECT.projectName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>Sunway Iskandar, Johor Bahru</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span>Tower B &amp; Tower C</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span>Floors 03 – 45</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              Demo data — not live
            </span>
          </div>

          {/* Quick-reference specs */}
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { label: "Tower B stacks", value: "8" },
              { label: "Tower C stacks", value: "19" },
              { label: "Residential floors", value: "03 – 45" },
              { label: "Mech. floor", value: "33 (Breaktank)" },
              { label: "BUA range (B)", value: "692 – 2,078 sqft" },
              { label: "BUA range (C)", value: "700 – 788 sqft" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm"
              >
                <span className="text-muted-foreground">{label}: </span>
                <span className="font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="container py-8">
        <UnitAvailabilityChart data={DEMO_PROJECT} />
      </div>

      {/* Legend / explainer */}
      <div className="container pb-16">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">How to read this chart</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                color: "bg-emerald-100 border-emerald-300 dark:bg-emerald-900/40 dark:border-emerald-700",
                label: "Available",
                desc: "Unit is open for booking. Click to see details and pricing.",
              },
              {
                color: "bg-amber-100 border-amber-300 dark:bg-amber-900/40 dark:border-amber-700",
                label: "Reserved",
                desc: "Booking in progress. Contact agent for waitlist.",
              },
              {
                color: "bg-rose-100 border-rose-300 dark:bg-rose-900/40 dark:border-rose-700",
                label: "Sold",
                desc: "Unit has been purchased and is no longer available.",
              },
              {
                color: "border-dashed border-border/60 bg-muted/20",
                label: "Void / N/A",
                desc: "No unit on this position (stairwell, corridor, or service area).",
              },
            ].map(({ color, label, desc }) => (
              <div key={label} className="flex gap-3">
                <span
                  className={`mt-0.5 h-5 w-8 shrink-0 rounded border ${color}`}
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-muted-foreground/70">
            * This page uses deterministic demo data generated client-side. When a project's real
            unit inventory is imported into the database, the chart on the project detail page will
            automatically switch to live data with a{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">● Live data</span>{" "}
            indicator.
          </p>
        </div>
      </div>
    </div>
  );
}
