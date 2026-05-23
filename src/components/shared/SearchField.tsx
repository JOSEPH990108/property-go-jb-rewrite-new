"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchFieldSize = "sm" | "default";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  size?: SearchFieldSize;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
}

const sizeClasses: Record<SearchFieldSize, string> = {
  sm: "h-9 pl-9 pr-9 text-xs",
  default: "h-10 pl-10 pr-10",
};

export function SearchField({
  value,
  onChange,
  placeholder = "Search...",
  label = "Search",
  size = "default",
  disabled,
  className,
  inputClassName,
}: SearchFieldProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(sizeClasses[size], inputClassName)}
      />
      {value && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-1 size-8 -translate-y-1/2"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
