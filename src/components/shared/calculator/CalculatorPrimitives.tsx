"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface CalculatorShellProps {
  title: string;
  description: ReactNode;
  icon: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function CalculatorShell({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
}: CalculatorShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl p-4 pb-20 font-sans text-zinc-900 md:p-6 dark:text-zinc-100",
        className,
      )}
    >
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-600 p-3 shadow-lg shadow-indigo-600/20">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-zinc-500">{description}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

interface CalculatorSectionProps {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  tone?: "default" | "dark";
  className?: string;
  contentClassName?: string;
}

const calculatorSectionToneClasses: Record<NonNullable<CalculatorSectionProps["tone"]>, string> = {
  default: "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
  dark: "border-zinc-800 bg-zinc-900/50",
};

const calculatorSectionTitleToneClasses: Record<
  NonNullable<CalculatorSectionProps["tone"]>,
  string
> = {
  default: "text-zinc-800 dark:text-zinc-200",
  dark: "text-white",
};

export function CalculatorSection({
  title,
  icon: Icon,
  action,
  children,
  tone = "default",
  className,
  contentClassName,
}: CalculatorSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-6 shadow-sm",
        calculatorSectionToneClasses[tone],
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3
          className={cn(
            "flex items-center gap-2 font-bold",
            calculatorSectionTitleToneClasses[tone],
          )}
        >
          {Icon && <Icon className="h-4 w-4" />}
          {title}
        </h3>
        {action}
      </div>
      <div className={cn("mt-6 space-y-6", contentClassName)}>{children}</div>
    </section>
  );
}

interface SliderNumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  helper?: ReactNode;
  badge?: ReactNode;
  showSlider?: boolean;
  inputClassName?: string;
  className?: string;
}

export function SliderNumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  prefix,
  suffix,
  helper,
  badge,
  showSlider = true,
  inputClassName,
  className,
}: SliderNumberFieldProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">{label}</label>
        {badge}
      </div>
      <div className="relative">
        {prefix && (
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm font-medium text-zinc-400">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          min={min}
          max={max}
          step={step}
          className={cn(
            "w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pr-4 pl-4 font-mono text-lg font-bold transition-all outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-black",
            prefix && "pl-10",
            suffix && "pr-10",
            inputClassName,
          )}
        />
        {suffix && (
          <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-zinc-400">
            {suffix}
          </span>
        )}
      </div>
      {showSlider && max !== undefined && (
        <Slider
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={([nextValue]) => onChange(nextValue)}
          className="py-2"
        />
      )}
      {helper && <div className="text-xs text-zinc-500 dark:text-zinc-400">{helper}</div>}
    </div>
  );
}

interface CalculatorMetricCardProps {
  label: string;
  value: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function CalculatorMetricCard({
  label,
  value,
  children,
  className,
}: CalculatorMetricCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 to-zinc-900 p-6 text-white shadow-xl",
        className,
      )}
    >
      <div className="pointer-events-none absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
      <div>
        <p className="mb-1 text-xs font-bold tracking-widest text-indigo-200 uppercase">{label}</p>
        <div className="text-4xl font-bold tracking-tighter text-white sm:text-5xl">{value}</div>
      </div>
      {children && <div className="mt-8 space-y-3">{children}</div>}
    </div>
  );
}

interface BreakdownRowProps {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  highlight?: boolean;
  className?: string;
}

export function BreakdownRow({ label, value, note, highlight, className }: BreakdownRowProps) {
  return (
    <div className={cn("flex items-center justify-between text-sm", className)}>
      <div className="flex items-center gap-1">
        <span
          className={cn(
            highlight
              ? "font-bold text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 dark:text-zinc-400",
          )}
        >
          {label}
        </span>
        {note && <span className="text-[10px] text-zinc-400">{note}</span>}
      </div>
      <span
        className={cn(
          "font-mono",
          highlight
            ? "font-bold text-zinc-900 dark:text-white"
            : "text-zinc-700 dark:text-zinc-300",
        )}
      >
        {value}
      </span>
    </div>
  );
}
