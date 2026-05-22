"use client";

import { Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SelectOption = { value: string; label: string };

// ── Generic helpers ───────────────────────────────────────────────────────────

export function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-white/80">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </Label>
      {children}
    </div>
  );
}

export function FieldInput({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <Field label={label} required={required}>
      <Input
        className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-primary/40"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </Field>
  );
}

export function FieldSelect({
  label,
  required,
  value,
  onChange,
  options,
  placeholder = "Select…",
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) {
  return (
    <Field label={label} required={required}>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="border-white/10 bg-white/5 text-white focus:ring-primary/40">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="border-white/10 bg-slate-900 text-white">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

export function FieldSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
      <Label className="cursor-pointer text-sm text-white/80">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// ── Dynamic rows table ────────────────────────────────────────────────────────

export function DynamicRows<T extends object>({
  rows,
  addRow,
  removeRow,
  addLabel = "Add row",
  children,
}: {
  rows: T[];
  addRow: () => void;
  removeRow: (i: number) => void;
  addLabel?: string;
  children: (row: T, index: number) => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div
          key={i}
          className="relative rounded-xl border border-white/10 bg-white/[0.03] p-4"
        >
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="absolute right-3 top-3 text-red-400/70 hover:text-red-400"
            aria-label="Remove row"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {children(row, i)}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRow}
        className="w-full border-dashed border-white/20 bg-transparent text-white/60 hover:border-primary/40 hover:text-white"
      >
        <Plus className="mr-2 h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────

export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
    </div>
  );
}

// ── Sub-section divider ────────────────────────────────────────────────────────

export function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">{title}</p>
      {children}
    </div>
  );
}
