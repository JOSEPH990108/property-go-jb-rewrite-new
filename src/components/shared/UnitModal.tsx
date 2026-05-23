"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UnitRecord } from "@/lib/admin-mock-data";

type UnitModalProps = {
  unitData: UnitRecord | null;
  viewMode: "admin" | "customer";
  open: boolean;
  onClose: () => void;
};

export function UnitModal({ unitData, viewMode, open, onClose }: UnitModalProps) {
  const bookingDisabled = unitData?.status !== "available";

  return (
    <AnimatePresence>
      {open && unitData ? (
        <>
          <motion.button
            type="button"
            className="bg-background/70 fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="border-border bg-card text-foreground fixed top-1/2 left-1/2 z-50 w-[min(92vw,540px)] -translate-x-1/2 -translate-y-1/2 rounded-[30px] border p-6 shadow-[0_30px_100px_rgba(8,17,32,0.2)] backdrop-blur-xl"
          >
            <div className="border-border flex items-start justify-between gap-4 border-b pb-5">
              <div>
                <p className="text-primary/80 text-xs tracking-[0.24em] uppercase">
                  {unitData.projectName}
                </p>
                <h3 className="mt-2 text-3xl font-semibold">{unitData.unitId}</h3>
                <p className="text-foreground/70 mt-1 text-sm">Live unit availability preview</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="border-border bg-background text-foreground hover:bg-muted/30 inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoCard label="Lot Size" value={unitData.lotSize} />
              <InfoCard label="Facing" value={unitData.facing} />
              <InfoCard label="SPA Price" value={`RM ${unitData.spaPrice.toLocaleString()}.00`} />
              <InfoCard label="Status" value={toStatusLabel(unitData.status)} />
            </div>

            <div className="border-border bg-background mt-6 rounded-[24px] border p-4">
              <p className="text-foreground/60 text-xs tracking-[0.24em] uppercase">
                Role-aware action
              </p>

              {viewMode === "admin" ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className="border-primary/20 bg-primary/12 text-primary rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_0_28px_hsl(var(--primary)/0.2)]"
                  >
                    Update Status
                  </button>
                  <button
                    type="button"
                    className="border-border bg-card text-foreground rounded-2xl border px-4 py-3 text-sm font-medium"
                  >
                    Edit Details
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={bookingDisabled}
                  className={cn(
                    "mt-4 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    bookingDisabled
                      ? "border-border/70 bg-muted text-muted-foreground cursor-not-allowed border"
                      : "border border-emerald-300/20 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 text-slate-950 shadow-[0_0_30px_rgba(34,197,94,0.35)]",
                  )}
                >
                  Pay Booking Fee (RM 5,000)
                </button>
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-background rounded-[22px] border px-4 py-4">
      <p className="text-foreground/60 text-xs tracking-[0.22em] uppercase">{label}</p>
      <p className="text-foreground mt-3 text-lg font-semibold">{value}</p>
    </div>
  );
}

function toStatusLabel(status: UnitRecord["status"]) {
  if (status === "available") return "Available";
  if (status === "reserved") return "Reserved";
  return "Sold";
}
