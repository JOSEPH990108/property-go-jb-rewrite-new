// src\components\custom\feature\tools\DSRCalculator.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, Wallet, ArrowRightLeft, Settings2, RefreshCw, TrendingUp } from "lucide-react";

import {
  BreakdownRow,
  CalculatorSection,
  CalculatorShell,
} from "@/components/shared/calculator/CalculatorPrimitives";

// --- Types ---
type CalculatorMode = "MY" | "SG";

type DSRState = {
  basicSalary: number;
  fixedAllowance: number;
  variableIncome: number;
  variableRecognition: number;
  fixedLoans: number;
  ccBalance: number;
  newLoanInstallment: number;
};

// --- API CONFIGURATION ---
// Replace this URL with your specific API if needed.
// This is a free, public endpoint that returns live SGD rates.
const API_URL = "https://open.er-api.com/v6/latest/SGD";

// --- Helper: Format Currency ---
const formatCurrency = (val: number, currency: string) =>
  new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(val);

export default function DsrCalculatorLive() {
  const [mode, setMode] = useState<CalculatorMode>("MY");
  const [activeTab, setActiveTab] = useState<"income" | "debt">("income");

  // State for Dynamic Exchange Rate
  const [exchangeRate, setExchangeRate] = useState<number>(3.55); // Fallback
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const [values, setValues] = useState<DSRState>({
    basicSalary: 5000,
    fixedAllowance: 0,
    variableIncome: 2000,
    variableRecognition: 80,
    fixedLoans: 1500,
    ccBalance: 3000,
    newLoanInstallment: 2500,
  });

  // --- 1. Fetch Live Rate ---
  const fetchLiveRate = async () => {
    setIsLoadingRate(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      // Assuming structure: { rates: { MYR: 3.55, ... } }
      if (data && data.rates && data.rates.MYR) {
        setExchangeRate(data.rates.MYR);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Failed to fetch rate, using fallback.", error);
    } finally {
      setIsLoadingRate(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchLiveRate();
  }, []);

  // --- 2. Calculations ---
  const results = useMemo(() => {
    const isSG = mode === "SG";
    const rate = isSG ? exchangeRate : 1;

    // Income
    const recognizedVariable = values.variableIncome * (values.variableRecognition / 100);
    const totalIncomeNative = values.basicSalary + values.fixedAllowance + recognizedVariable;
    const totalIncomeMYR = totalIncomeNative * rate;

    // Debt
    const ccCommitmentNative = values.ccBalance * 0.05;
    const totalExistingDebtsNative = values.fixedLoans + ccCommitmentNative;
    const totalExistingDebtsMYR = totalExistingDebtsNative * rate;

    // Total (New Loan is always MYR)
    const totalCommitmentsMYR = totalExistingDebtsMYR + values.newLoanInstallment;

    // DSR
    let dsr = 0;
    if (totalIncomeMYR > 0) {
      dsr = (totalCommitmentsMYR / totalIncomeMYR) * 100;
    }

    // Max Loan (Reverse Eng: 35 Years @ 4.25%)
    const maxAllowedCommitment = totalIncomeMYR * 0.7;
    const availableForLoan = Math.max(0, maxAllowedCommitment - totalExistingDebtsMYR);
    const r = 0.0425 / 12;
    const n = 35 * 12;
    const maxLoan = availableForLoan * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)));

    // Status
    let status: "Safe" | "Moderate" | "Risky" = "Safe";
    if (dsr > 70) status = "Risky";
    else if (dsr > 60) status = "Moderate";

    return {
      totalIncomeMYR,
      ccCommitmentNative,
      totalCommitmentsMYR,
      dsr,
      maxLoan,
      status,
    };
  }, [values, mode, exchangeRate]);

  const updateVal = (key: keyof DSRState, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const currentCurrency = mode === "SG" ? "SGD" : "MYR";

  return (
    <CalculatorShell
      title="Loan Eligibility"
      description={
        <span className="flex items-center gap-2">
          <span>{mode === "SG" ? "Cross-Border Calculation" : "Standard Calculation"}</span>
          {mode === "SG" && (
            <span className="flex items-center gap-2 rounded border border-blue-900/30 bg-blue-900/20 px-2 py-0.5 text-xs text-blue-300">
              <span>Rate: {exchangeRate.toFixed(4)}</span>
              <button
                onClick={fetchLiveRate}
                disabled={isLoadingRate}
                className="transition-colors hover:text-white"
              >
                <RefreshCw className={`h-3 w-3 ${isLoadingRate ? "animate-spin" : ""}`} />
              </button>
            </span>
          )}
        </span>
      }
      icon={Wallet}
      action={
        <div className="relative flex items-center rounded-xl border border-zinc-800 bg-zinc-900 p-1">
          <motion.div
            className="absolute top-1 bottom-1 w-[120px] rounded-lg bg-zinc-800 shadow-sm"
            initial={false}
            animate={{ x: mode === "MY" ? 4 : 128 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button
            onClick={() => setMode("MY")}
            className={`relative z-10 flex w-[124px] items-center justify-center gap-2 py-2 text-sm font-bold transition-colors ${mode === "MY" ? "text-white" : "text-zinc-500"}`}
          >
            🇲🇾 Malaysia
          </button>
          <button
            onClick={() => setMode("SG")}
            className={`relative z-10 flex w-[124px] items-center justify-center gap-2 py-2 text-sm font-bold transition-colors ${mode === "SG" ? "text-white" : "text-zinc-500"}`}
          >
            🇸🇬 Singapore
          </button>
        </div>
      }
      className="min-h-[600px] max-w-5xl rounded-3xl border border-zinc-800 bg-zinc-950 p-4 text-zinc-100 shadow-2xl md:p-8"
    >
      {/* Mobile Tabs */}
      <div className="mb-6 flex w-full rounded-lg border border-zinc-800 bg-zinc-900 p-1 md:hidden">
        <button
          onClick={() => setActiveTab("income")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${activeTab === "income" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}
        >
          Income
        </button>
        <button
          onClick={() => setActiveTab("debt")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${activeTab === "debt" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}
        >
          Debt
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* --- LEFT: Inputs --- */}
        <div className="space-y-8 lg:col-span-7">
          <CalculatorSection
            title={`Monthly Income (${currentCurrency})`}
            icon={Wallet}
            tone="dark"
            className={`${activeTab === "income" ? "block" : "hidden md:block"} border-0 bg-transparent p-0 shadow-none`}
            contentClassName="space-y-6"
          >
            <CustomSlider
              label="Basic Salary"
              value={values.basicSalary}
              max={20000}
              currency={currentCurrency}
              exchangeRate={mode === "SG" ? exchangeRate : undefined}
              onChange={(v) => updateVal("basicSalary", v)}
            />
            <CustomSlider
              label="Fixed Allowance"
              value={values.fixedAllowance}
              max={5000}
              currency={currentCurrency}
              exchangeRate={mode === "SG" ? exchangeRate : undefined}
              onChange={(v) => updateVal("fixedAllowance", v)}
            />

            <div className="relative overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
              <div className="absolute top-0 left-0 h-full w-1 bg-blue-500/50" />
              <div className="mb-2 flex justify-between">
                <label className="text-sm font-medium text-zinc-300">Commission / OT</label>
                <span className="rounded bg-blue-500/10 px-2 py-1 text-[10px] font-bold tracking-wider text-blue-400 uppercase">
                  Recognized @ {values.variableRecognition}%
                </span>
              </div>
              <CustomSlider
                label=""
                value={values.variableIncome}
                max={15000}
                currency={currentCurrency}
                exchangeRate={mode === "SG" ? exchangeRate : undefined}
                onChange={(v) => updateVal("variableIncome", v)}
                hideLabel
              />
              <div className="mt-4 flex gap-2">
                {[50, 80, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => updateVal("variableRecognition", pct)}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${
                      values.variableRecognition === pct
                        ? "border-blue-500 bg-blue-600 font-bold text-white shadow-lg shadow-blue-900/20"
                        : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </CalculatorSection>

          <CalculatorSection
            title={`Existing Commitments (${currentCurrency})`}
            icon={CreditCard}
            tone="dark"
            className={`${activeTab === "debt" ? "block" : "hidden md:block"} border-0 bg-transparent p-0 shadow-none`}
            contentClassName="space-y-6"
          >
            <CustomSlider
              label="Fixed Loans (Car, Personal)"
              value={values.fixedLoans}
              max={10000}
              currency={currentCurrency}
              exchangeRate={mode === "SG" ? exchangeRate : undefined}
              onChange={(v) => updateVal("fixedLoans", v)}
            />

            <div className="relative overflow-hidden rounded-xl border border-red-900/20 bg-red-900/10 p-4">
              <div className="absolute top-0 left-0 h-full w-1 bg-red-500/50" />
              <div className="mb-2 flex items-end justify-between">
                <label className="text-sm font-medium text-red-200">CC Outstanding Balance</label>
                <div className="text-right">
                  <span className="block text-[10px] tracking-wider text-red-400 uppercase">
                    Commitment (5%)
                  </span>
                  <span className="text-sm font-bold text-red-100">
                    {formatCurrency(results.ccCommitmentNative, currentCurrency)}
                  </span>
                </div>
              </div>
              <CustomSlider
                label=""
                value={values.ccBalance}
                max={50000}
                onChange={(v) => updateVal("ccBalance", v)}
                currency={currentCurrency}
                hideLabel
                trackColor="bg-red-900/40"
                thumbColor="bg-red-500"
              />
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded border border-emerald-900/50 bg-emerald-900/30 p-1.5">
                  <ArrowRightLeft className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="text-sm font-medium text-emerald-400">
                  New Property (Always MYR)
                </span>
              </div>
              <CustomSlider
                label="Estimated Installment"
                value={values.newLoanInstallment}
                max={15000}
                currency="MYR"
                onChange={(v) => updateVal("newLoanInstallment", v)}
              />
            </div>
          </CalculatorSection>
        </div>

        {/* --- RIGHT: Results --- */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-6">
            {/* Score Card */}
            <div
              className={`relative overflow-hidden rounded-3xl border p-8 transition-colors duration-500 ${
                results.status === "Safe"
                  ? "border-emerald-900/50 bg-zinc-900"
                  : results.status === "Moderate"
                    ? "border-amber-900/50 bg-zinc-900"
                    : "border-red-900/50 bg-zinc-900"
              } `}
            >
              {/* Glow */}
              <div
                className={`pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-gradient-to-br opacity-20 blur-3xl transition-colors duration-500 ${
                  results.status === "Safe"
                    ? "from-emerald-500"
                    : results.status === "Moderate"
                      ? "from-amber-500"
                      : "from-red-500"
                } `}
              />

              <div className="relative z-10 space-y-2 text-center">
                <p className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">
                  Debt Service Ratio
                </p>
                <div
                  className={`text-7xl font-bold tracking-tighter transition-colors duration-300 ${
                    results.status === "Safe"
                      ? "text-emerald-400"
                      : results.status === "Moderate"
                        ? "text-amber-400"
                        : "text-red-400"
                  } `}
                >
                  {results.dsr.toFixed(1)}
                  <span className="align-top text-3xl opacity-50">%</span>
                </div>

                <div className="mt-2 flex items-center justify-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase ${
                      results.status === "Safe"
                        ? "border-emerald-900 bg-emerald-950/50 text-emerald-400"
                        : results.status === "Moderate"
                          ? "border-amber-900 bg-amber-950/50 text-amber-400"
                          : "border-red-900 bg-red-950/50 text-red-400"
                    } `}
                  >
                    {results.status}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative mt-8 h-3 overflow-hidden rounded-full border border-zinc-800 bg-zinc-950">
                <div className="absolute top-0 bottom-0 left-[70%] z-10 w-0.5 bg-white/20" />
                <motion.div
                  className={`h-full rounded-full ${
                    results.status === "Safe"
                      ? "bg-emerald-500"
                      : results.status === "Moderate"
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(results.dsr, 100)}%` }}
                />
              </div>
            </div>

            {/* Max Loan */}
            <div className="group flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-zinc-700">
              <div>
                <p className="mb-1 text-xs tracking-wider text-zinc-500 uppercase">
                  Max Loan Eligibility
                </p>
                <p className="text-3xl font-bold text-white transition-colors group-hover:text-blue-400">
                  {formatCurrency(results.maxLoan, "MYR")}
                </p>
                <p className="mt-1 text-[10px] text-zinc-600">Based on 35 Years @ 4.25%</p>
              </div>
              <div className="rounded-full border border-zinc-800 bg-zinc-950 p-4">
                <TrendingUp className="h-6 w-6 text-zinc-400" />
              </div>
            </div>

            {/* Summary */}
            <CalculatorSection
              title="Calculation Breakdown"
              icon={Settings2}
              tone="dark"
              contentClassName="space-y-4"
              className="border-zinc-800/50"
            >
              {mode === "SG" && (
                <div className="flex items-center justify-between rounded-lg border border-blue-900/30 bg-blue-900/20 p-3 text-xs text-blue-200">
                  <span>Rate: 1 SGD = {exchangeRate.toFixed(4)} MYR</span>
                  <span className="text-[10px] opacity-50">{lastUpdated}</span>
                </div>
              )}

              <div className="space-y-2">
                <Row label="Total Net Income" value={results.totalIncomeMYR} />
                <Row label="Total Commitments" value={results.totalCommitmentsMYR} isMinus />
                <div className="my-2 h-px bg-zinc-800" />
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-zinc-400">Net Disposable</span>
                  <span className="text-white">
                    {formatCurrency(results.totalIncomeMYR - results.totalCommitmentsMYR, "MYR")}
                  </span>
                </div>
              </div>
            </CalculatorSection>
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}

const Row = ({ label, value, isMinus }: { label: string; value: number; isMinus?: boolean }) => (
  <BreakdownRow
    label={label}
    value={`${isMinus ? "-" : ""} ${formatCurrency(value, "MYR")}`}
    className="text-sm"
  />
);

interface CustomSliderProps {
  label: string;
  value: number;
  max: number;
  currency: string;
  onChange: (val: number) => void;
  hideLabel?: boolean;
  trackColor?: string;
  thumbColor?: string;
  exchangeRate?: number;
}

const CustomSlider = ({
  label,
  value,
  max,
  currency,
  onChange,
  hideLabel,
  trackColor = "bg-zinc-800",
  thumbColor = "bg-zinc-200",
  exchangeRate,
}: CustomSliderProps) => {
  const convertedValue = exchangeRate ? value * exchangeRate : null;

  return (
    <div className="group/slider space-y-3">
      {!hideLabel && (
        <div className="flex items-end justify-between">
          <label className="text-sm font-medium text-zinc-400 transition-colors group-hover/slider:text-zinc-200">
            {label}
          </label>
          <div className="text-right">
            <div className="font-mono text-sm font-bold text-white">
              {formatCurrency(value, currency)}
            </div>
            {convertedValue && (
              <div className="font-mono text-[10px] text-zinc-500">
                ≈ {formatCurrency(convertedValue, "MYR")}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative flex h-6 items-center">
        <input
          type="range"
          min={0}
          max={max}
          step={50}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute z-20 h-full w-full cursor-pointer opacity-0"
        />
        <div className={`h-1.5 w-full overflow-hidden rounded-full ${trackColor} z-10`}>
          <div
            className={`h-full ${thumbColor} transition-colors duration-300 group-hover/slider:bg-blue-500`}
            style={{ width: `${(value / max) * 100}%` }}
          />
        </div>
        <div
          className={`pointer-events-none absolute z-10 h-4 w-4 rounded-full shadow-lg transition-transform duration-100 ${thumbColor} group-hover/slider:scale-125`}
          style={{ left: `calc(${(value / max) * 100}% - 8px)` }}
        />
      </div>
    </div>
  );
};
