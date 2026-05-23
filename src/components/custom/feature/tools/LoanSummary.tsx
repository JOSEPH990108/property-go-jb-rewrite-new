// src\components\custom\feature\tools\LoanSummary.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";
import { formatCurrency } from "@/lib/utils";
import { useLoanCalculatorStore } from "@/stores/loan-calculator-store";
import { useLoanCalculation } from "@/hooks/useLoanCalculation";

export default function LoanSummary() {
  const { spaPrice, interestRate, tenureYears } = useLoanCalculatorStore();
  const {
    downPaymentAmount,
    loanAmount,
    monthlyInstallment,
    totalInterest,
    totalPayment,
    lastPaymentDate,
  } = useLoanCalculation();
  const [expandSummary, setExpandSummary] = useState(false);
  const summaryItems = [
    {
      label: "Purchase Price (SPA)",
      value: formatCurrency(spaPrice),
      icon: "🏠",
    },
    {
      label: "Down Payment",
      value: formatCurrency(downPaymentAmount),
      icon: "💸",
    },
    { label: "Loan Amount", value: formatCurrency(loanAmount), icon: "🏦" },
    { label: "Interest Rate", value: `${interestRate}% p.a.`, icon: "📉" },
    { label: "Loan Tenure", value: `${tenureYears} years`, icon: "📅" },
    {
      label: "Last Payment Due",
      value: lastPaymentDate.toLocaleDateString(),
      icon: "📆",
    },
    {
      label: "Monthly Installment",
      value: formatCurrency(monthlyInstallment),
      icon: "📈",
    },
    {
      label: "Total Interest Payable",
      value: formatCurrency(totalInterest),
      icon: "💰",
    },
    { label: "Total Payment", value: formatCurrency(totalPayment), icon: "🧾" },
  ];
  return (
    <>
      {/* Loan Summary Panel */}
      <div className="rounded-lg bg-white p-4 text-sm text-zinc-800 shadow dark:bg-zinc-900 dark:text-zinc-200">
        <div
          onClick={() => setExpandSummary(!expandSummary)}
          className="flex cursor-pointer items-center justify-between"
        >
          <h3 className="text-lg font-bold">📋 Loan Summary</h3>
          {expandSummary ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>

        <div
          className={clsx(
            "overflow-hidden transition-all",
            expandSummary ? "mt-3 max-h-[1000px] space-y-2" : "max-h-0",
          )}
        >
          {summaryItems.map(({ label, value, icon }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{icon}</span>
                <span>{label}:</span>
              </div>
              <span className="text-right font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
