// src\components\custom\feature\tools\LoanAmortizationTable.tsx
"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Download, Maximize2, Minimize2, Table2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAmortizationSchedule } from "@/hooks/useAmortizationSchedule";
import { formatCurrency } from "@/lib/utils";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function LoanAmortizationTable() {
  const schedule = useAmortizationSchedule();
  // Default expanded: Year 1
  const [expandedYears, setExpandedYears] = useState<number[]>([1]);

  // 1. Group Data by Year
  const groupedData = useMemo(() => {
    return schedule.reduce<Record<number, typeof schedule>>((acc, row) => {
      acc[row.year] = acc[row.year] || [];
      acc[row.year].push(row);
      return acc;
    }, {});
  }, [schedule]);

  const years = Object.keys(groupedData).map(Number);

  // 2. Handlers
  const toggleYear = (year: number) => {
    setExpandedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year],
    );
  };

  const toggleAll = () => {
    if (expandedYears.length === years.length) {
      setExpandedYears([]);
    } else {
      setExpandedYears(years);
    }
  };

  const exportCSV = () => {
    const header = "Year,Month,Principal,Interest,Total Payment,Balance\n";
    const body = schedule
      .map((r) => `${r.year},${r.month},${r.principal},${r.interest},${r.total},${r.balance}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, "amortization_schedule.csv");
  };

  return (
    <div className="bg-card border-border flex h-[600px] flex-col overflow-hidden rounded-xl border shadow-lg">
      {/* --- HEADER CONTROLS --- */}
      <div className="border-border bg-card/50 flex shrink-0 flex-col justify-between gap-4 border-b p-5 backdrop-blur-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="bg-accent/10 border-accent/20 rounded-lg border p-2.5">
            <Table2 className="text-accent h-5 w-5" />
          </div>
          <span className="text-foreground font-serif text-lg font-bold">
            Amortization Overview
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleAll}
            className="bg-muted hover:bg-muted/80 text-muted-foreground border-border flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-colors"
          >
            {expandedYears.length === years.length ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" /> Collapse All
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" /> Expand All
              </>
            )}
          </button>

          <button
            onClick={exportCSV}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold shadow-md transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* --- SCROLLABLE CONTENT AREA --- */}
      <div
        className="custom-scrollbar flex-1 space-y-3 overflow-y-auto overscroll-contain p-4"
        data-lenis-prevent
      >
        {years.map((year) => {
          const months = groupedData[year];
          const yearPrincipal = months.reduce((sum, r) => sum + r.principal, 0);
          const yearInterest = months.reduce((sum, r) => sum + r.interest, 0);
          const isOpen = expandedYears.includes(year);

          return (
            <div
              key={year}
              className="border-border bg-card hover:border-accent/40 overflow-hidden rounded-xl border shadow-sm transition-all duration-300"
            >
              {/* Year Summary Row (Accordion Trigger) */}
              <button
                onClick={() => toggleYear(year)}
                className="bg-muted/30 hover:bg-muted/50 group flex w-full items-center justify-between p-4 text-left transition-colors"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🗓️</span>
                    <span className="text-foreground font-serif font-bold">Year {year}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-3 text-xs opacity-80 transition-opacity group-hover:opacity-100">
                    <span>
                      Principal:{" "}
                      <span className="text-foreground font-mono">
                        {formatCurrency(yearPrincipal)}
                      </span>
                    </span>
                    <span className="bg-border h-3 w-px"></span>
                    <span>
                      Interest:{" "}
                      <span className="text-accent font-mono">{formatCurrency(yearInterest)}</span>
                    </span>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronDown className="text-accent h-5 w-5" />
                ) : (
                  <ChevronRight className="text-muted-foreground group-hover:text-foreground h-5 w-5" />
                )}
              </button>

              {/* Monthly Table (Collapsible Content) */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <div className="overflow-x-auto">
                      <table className="border-border w-full border-t text-left text-xs md:text-sm">
                        <thead className="bg-muted/50 text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                          <tr>
                            <th className="w-16 px-4 py-3 text-center">Mth</th>
                            <th className="px-4 py-3">Principal</th>
                            <th className="px-4 py-3">Interest</th>
                            <th className="hidden w-1/3 px-4 py-3 text-center md:table-cell">
                              Split
                            </th>
                            <th className="px-4 py-3 text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-border divide-y">
                          {months.map((row) => {
                            const total = row.principal + row.interest;
                            const pPct = (row.principal / total) * 100;
                            const iPct = 100 - pPct;

                            return (
                              <tr key={row.month} className="hover:bg-muted/20 transition-colors">
                                <td className="text-muted-foreground px-4 py-3 text-center font-mono">
                                  {row.month}
                                </td>
                                <td className="text-foreground px-4 py-3 font-mono">
                                  {formatCurrency(row.principal)}
                                </td>
                                <td className="text-destructive px-4 py-3 font-mono">
                                  {formatCurrency(row.interest)}
                                </td>

                                {/* Visual Payment Bar */}
                                <td className="hidden px-4 py-3 md:table-cell">
                                  <div className="bg-muted flex h-1.5 w-full overflow-hidden rounded-full">
                                    <div
                                      className="h-full bg-blue-500"
                                      style={{ width: `${pPct}%` }}
                                      title={`Principal: ${pPct.toFixed(1)}%`}
                                    />
                                    <div
                                      className="bg-destructive h-full"
                                      style={{ width: `${iPct}%` }}
                                      title={`Interest: ${iPct.toFixed(1)}%`}
                                    />
                                  </div>
                                </td>

                                <td className="text-foreground px-4 py-3 text-right font-mono font-bold">
                                  {formatCurrency(row.balance)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
