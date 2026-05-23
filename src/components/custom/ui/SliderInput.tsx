// src\components\custom\ui\SliderInput.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  sublabel?: string;
  onChange: (value: number) => void;
  className?: string;
}

export function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  className,
}: SliderInputProps) {
  const [inputValue, setInputValue] = React.useState(value.toString());

  // Update local input state when prop value changes (e.g. via slider)
  React.useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    const newVal = parseFloat(inputValue);
    if (!isNaN(newVal)) {
      // Clamp value on blur
      const clamped = Math.max(min, newVal);
      onChange(clamped);
      setInputValue(clamped.toString());
    } else {
      // Revert to current prop value if invalid
      setInputValue(value.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur();
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange(val);
  };

  // Calculate percentage for background gradient
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex items-end justify-between">
        <label className="text-muted-foreground text-sm font-medium">{label}</label>
        <div className="group relative">
          <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
            {unit}
          </span>
          <Input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(
              "hover:border-border focus:border-accent h-auto w-32 border-transparent bg-transparent py-1 pr-2 pl-8 text-right font-serif text-lg transition-all",
              "rounded-lg shadow-none focus:shadow-none focus:ring-0",
            )}
          />
        </div>
      </div>

      <div className="relative flex h-6 w-full items-center">
        {/* Custom Track */}
        <div className="bg-secondary absolute h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-foreground dark:bg-foreground h-full transition-all duration-100 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Range Input (Invisible but interactive) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="absolute z-10 h-full w-full cursor-pointer opacity-0"
        />

        {/* Custom Thumb (Visual Only - follows the percentage) */}
        <div
          className="bg-background border-foreground pointer-events-none absolute flex h-5 w-5 items-center justify-center rounded-full border-2 shadow-lg transition-all duration-100 ease-out"
          style={{ left: `calc(${percentage}% - 10px)` }}
        >
          <div className="bg-foreground h-1.5 w-1.5 rounded-full" />
        </div>
      </div>
    </div>
  );
}
