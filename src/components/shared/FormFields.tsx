"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FieldShell } from "@/components/shared/FieldShell";
import { cn } from "@/lib/utils";

export type FieldOption = { value: string; label: string; disabled?: boolean };

interface SharedFieldProps {
  label: string;
  required?: boolean;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
}

interface FieldInputProps extends SharedFieldProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  inputClassName?: string;
}

export function FieldInput({
  label,
  required,
  helperText,
  error,
  className,
  value,
  onChange,
  placeholder,
  type = "text",
  inputClassName,
}: FieldInputProps) {
  const id = React.useId();

  return (
    <FieldShell
      label={label}
      htmlFor={id}
      required={required}
      helperText={helperText}
      error={error}
      className={className}
    >
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={inputClassName}
      />
    </FieldShell>
  );
}

interface FieldSelectProps extends SharedFieldProps {
  value?: string;
  onChange: (value: string) => void;
  options: FieldOption[];
  placeholder?: string;
  triggerClassName?: string;
}

export function FieldSelect({
  label,
  required,
  helperText,
  error,
  className,
  value,
  onChange,
  options,
  placeholder = "Select...",
  triggerClassName,
}: FieldSelectProps) {
  return (
    <FieldShell
      label={label}
      required={required}
      helperText={helperText}
      error={error}
      className={className}
    >
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger aria-invalid={Boolean(error)} className={cn("w-full", triggerClassName)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}

interface FieldSwitchProps extends SharedFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function FieldSwitch({
  label,
  helperText,
  error,
  className,
  checked,
  onChange,
}: FieldSwitchProps) {
  const id = React.useId();

  return (
    <FieldShell
      label={label}
      htmlFor={id}
      helperText={helperText}
      error={error}
      className={className}
    >
      <div className="border-border bg-background flex items-center justify-between gap-4 rounded-lg border px-3 py-2">
        <span className="text-muted-foreground text-sm">{checked ? "Enabled" : "Disabled"}</span>
        <Switch id={id} checked={checked} onCheckedChange={onChange} />
      </div>
    </FieldShell>
  );
}
