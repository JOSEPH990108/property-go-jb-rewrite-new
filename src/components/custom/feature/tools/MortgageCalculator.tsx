// src\components\custom\feature\tools\MortgageCalculator.tsx
"use client";

import { Calculator, DollarSign, Settings2, RotateCcw, Calendar } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

// --- Internal Imports (Ensure these match your file structure) ---
import { useLoanCalculatorStore } from "@/stores/loan-calculator-store";
import { useLoanCalculation } from "@/hooks/useLoanCalculation";
import { formatCurrency } from "@/lib/utils";
import LoanAmortizationTable from "./LoanAmortizationTable";
import {
  BreakdownRow,
  CalculatorMetricCard,
  CalculatorSection,
  CalculatorShell,
  SliderNumberField,
} from "@/components/shared/calculator/CalculatorPrimitives";

// --- SVG Math for Pie Chart (From LoanStatistic.tsx) ---
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? "1" : "0";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export default function ProMortgageCalculator() {
  const store = useLoanCalculatorStore();
  const results = useLoanCalculation();
  const sinkingFee = store.sqft * store.sinkRate;

  // --- Chart Logic ---
  // Calculate Interest % for the Pie Chart
  const principalPct = (results.loanAmount / results.totalPayment) * 100;
  const interestPct = 100 - principalPct;
  const interestAngle = (interestPct / 100) * 360;

  const handleReset = () => {
    store.setSpaPrice(500000);
    store.setDownPaymentRate(10);
    store.setInterestRate(4.5);
    store.setTenureYears(30);
    store.setRebate(0);
    store.setSqft(1000);
    store.setSinkRate(0.35);
    store.setDeveloperDiscounts({
      spaLegalFee: false,
      spaStampDuty: false,
      loanLegalFee: false,
      loanStampDuty: false,
      rebate: false,
    });
  };

  return (
    <CalculatorShell
      title="Pro Mortgage Calculator"
      description="Integrated Analysis & Amortization"
      icon={Calculator}
      action={
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-xs font-medium transition hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          <RotateCcw className="h-3 w-3" /> Reset All
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        {/* --- LEFT COLUMN: INPUTS --- */}
        <div className="space-y-6 xl:col-span-4">
          {/* 1. Core Inputs */}
          <CalculatorSection title="Loan Parameters" icon={Settings2}>
            {/* Price */}
            <SliderNumberField
              label="Property Price"
              value={store.spaPrice}
              onChange={store.setSpaPrice}
              min={100000}
              max={3000000}
              step={10000}
              prefix="RM"
            />

            {/* Downpayment */}
            <SliderNumberField
              label="Down Payment"
              value={store.downPaymentRate}
              onChange={store.setDownPaymentRate}
              min={0}
              max={40}
              step={1}
              suffix="%"
              badge={
                <span className="rounded bg-indigo-50 px-2 py-0.5 font-mono text-xs font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                  {formatCurrency(results.downPaymentAmount)}
                </span>
              }
              inputClassName="text-center text-sm"
            />

            {/* Rate & Tenure */}
            <div className="grid grid-cols-2 gap-4">
              <SliderNumberField
                label="Interest Rate"
                suffix="%"
                value={store.interestRate}
                onChange={store.setInterestRate}
                step={0.05}
                showSlider={false}
                inputClassName="py-2.5 text-sm"
              />
              <SliderNumberField
                label="Tenure"
                suffix="Yrs"
                value={store.tenureYears}
                onChange={store.setTenureYears}
                max={35}
                showSlider={false}
                inputClassName="py-2.5 text-sm"
              />
            </div>
          </CalculatorSection>

          {/* 2. Advanced Details (Sinking Fund & Rebates) */}
          <CalculatorSection title="Advanced Costs" icon={DollarSign} contentClassName="space-y-5">
            {/* Sinking Fund Inputs */}
            <div className="space-y-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-400 uppercase">
                  Sinking Fund / Maintenance
                </label>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {formatCurrency(sinkingFee)}/mo
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500">Size (sqft)</label>
                  <input
                    type="number"
                    value={store.sqft}
                    onChange={(e) => store.setSqft(Number(e.target.value))}
                    className="w-full rounded border bg-white px-2 py-1 text-sm dark:bg-zinc-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500">Rate (RM)</label>
                  <input
                    type="number"
                    step={0.01}
                    value={store.sinkRate}
                    onChange={(e) => store.setSinkRate(Number(e.target.value))}
                    className="w-full rounded border bg-white px-2 py-1 text-sm dark:bg-zinc-800"
                  />
                </div>
              </div>
            </div>

            {/* Developer Packages */}
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                Developer Package
              </label>
              <ToggleRow
                label="Free SPA Legal"
                checked={store.developerDiscounts.spaLegalFee}
                onChange={(v) => store.setDeveloperDiscounts({ spaLegalFee: v })}
              />
              <ToggleRow
                label="Free MOT (Stamp)"
                checked={store.developerDiscounts.spaStampDuty}
                onChange={(v) => store.setDeveloperDiscounts({ spaStampDuty: v })}
              />
              <ToggleRow
                label="Free Loan Legal"
                checked={store.developerDiscounts.loanLegalFee}
                onChange={(v) => store.setDeveloperDiscounts({ loanLegalFee: v })}
              />
              <ToggleRow
                label="Free Loan Stamp"
                checked={store.developerDiscounts.loanStampDuty}
                onChange={(v) => store.setDeveloperDiscounts({ loanStampDuty: v })}
              />

              <div className="mt-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                <ToggleRow
                  label="Cash Rebate"
                  checked={store.developerDiscounts.rebate}
                  onChange={(v) => {
                    store.setDeveloperDiscounts({ rebate: v });
                    if (!v) store.setRebate(0);
                  }}
                />
                {store.developerDiscounts.rebate && (
                  <motion.input
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    type="number"
                    value={store.rebateAmount}
                    onChange={(e) => store.setRebate(Number(e.target.value))}
                    className="mt-2 w-full rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-bold text-green-700 placeholder-green-700/50 focus:outline-none dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400"
                    placeholder="Enter Rebate RM"
                  />
                )}
              </div>
            </div>
          </CalculatorSection>
        </div>

        {/* --- RIGHT COLUMN: ANALYTICS & RESULTS --- */}
        <div className="space-y-6 xl:col-span-8">
          {/* 1. Dashboard Row: Repayment + Pie Chart */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Card A: Monthly Payment & Dates */}
            <CalculatorMetricCard
              label="Estimated Monthly"
              value={formatCurrency(results.monthlyInstallment)}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2 text-sm">
                <span className="flex items-center gap-2 text-indigo-200">
                  <Calendar className="h-4 w-4" /> Last Payment
                </span>
                <span className="font-mono font-bold">
                  {results.lastPaymentDate ? results.lastPaymentDate.toLocaleDateString() : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-indigo-200">
                  <DollarSign className="h-4 w-4" /> Total Interest
                </span>
                <span className="font-mono font-bold">{formatCurrency(results.totalInterest)}</span>
              </div>
            </CalculatorMetricCard>

            {/* Card B: Visual Breakdown (Pie Chart from LoanStatistic) */}
            <div className="relative flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h4 className="absolute top-6 left-6 text-xs font-bold tracking-wider text-zinc-400 uppercase">
                Payment Split
              </h4>

              {/* The SVG Pie Chart */}
              <div className="relative mt-4 h-40 w-40">
                <svg viewBox="0 0 36 36" className="h-full w-full">
                  {/* Interest Slice (Red/Rose) */}
                  <path
                    d={describeArc(18, 18, 15.9155, 0, interestAngle)}
                    fill="none"
                    stroke="#e11d48"
                    strokeWidth="3"
                  />
                  {/* Principal Slice (Blue/Indigo) */}
                  <path
                    d={describeArc(18, 18, 15.9155, interestAngle, 360)}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3"
                  />
                </svg>
                {/* Center Text */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-zinc-400 uppercase">Total</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">
                    {(results.totalPayment / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Principal ({principalPct.toFixed(0)}%)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-600"></span>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Interest ({interestPct.toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Cash Required Breakdown (Collapsible or Full) */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
              <h3 className="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                <DollarSign className="h-5 w-5 text-green-600" /> Upfront Cash Required
              </h3>
              <span className="text-xl font-bold text-zinc-900 dark:text-white">
                {formatCurrency(results.cashRequired)}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-3 p-5 md:grid-cols-2">
              {/* Left Col Costs */}
              <div className="space-y-3">
                <CostRow label="Down Payment" value={results.downPaymentAmount} highlight />
                <CostRow label="SPA Legal Fee" value={results.spaLegalFee} />
                <CostRow label="Loan Legal Fee" value={results.loanLegalFee} />
              </div>
              {/* Right Col Costs */}
              <div className="space-y-3">
                <CostRow label="SPA Stamp Duty (MOT)" value={results.spaStampDuty} />
                <CostRow label="Loan Stamp Duty" value={results.loanStampDuty} />
                <CostRow label="Est. Disbursements" value={results.estDisbursement} note="(Misc)" />
              </div>

              {/* Rebate Row */}
              {store.rebateAmount > 0 && (
                <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-3 font-bold text-green-600 md:col-span-2 dark:border-zinc-800 dark:text-green-400">
                  <span>Less: Developer Rebate</span>
                  <span>- {formatCurrency(store.rebateAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Amortization Table (Imported Component) */}
          {/* This component handles its own CSV export and collapsible rows */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <LoanAmortizationTable />
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}

// --- Helper Components ---

const ToggleRow = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{label}</span>
    <Switch
      checked={checked}
      onCheckedChange={onChange}
      className="scale-75 data-[state=checked]:bg-indigo-600"
    />
  </div>
);

const CostRow = ({
  label,
  value,
  highlight,
  note,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  note?: string;
}) => (
  <BreakdownRow
    label={label}
    note={note}
    highlight={highlight}
    value={
      value === 0 ? (
        <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-600 uppercase dark:bg-green-900/30">
          Waived
        </span>
      ) : (
        formatCurrency(value)
      )
    }
  />
);
