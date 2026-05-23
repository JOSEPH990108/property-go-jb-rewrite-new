import { Bath, BedDouble, Calendar, Ruler } from "lucide-react";

import { cn } from "@/lib/utils";

type PropertySpecSummary = {
  minBedrooms: number | null;
  maxBedrooms: number | null;
  minBathrooms: number | null;
  maxBathrooms: number | null;
  minSqft: number | null;
  maxSqft: number | null;
  tenure?: string | null;
};

type PropertySpecTilesVariant = "compact" | "detail";

type PropertySpecTilesProps = {
  specs: PropertySpecSummary;
  variant?: PropertySpecTilesVariant;
  className?: string;
};

function formatSpecRange(
  min: number | null,
  max: number | null,
  {
    separator = " - ",
    preferMinimum = false,
  }: { separator?: string; preferMinimum?: boolean } = {},
) {
  if (preferMinimum && min !== null) return `${min}`;
  if (min === null && max === null) return "-";
  if (min === null) return `${max}`;
  if (max === null) return `${min}`;
  if (min === max) return `${min}`;
  return `${min}${separator}${max}`;
}

export function PropertySpecTiles({
  specs,
  variant = "detail",
  className,
}: PropertySpecTilesProps) {
  const isCompact = variant === "compact";
  const separator = isCompact ? "-" : " - ";
  const tiles = [
    {
      label: "Bedrooms",
      compactLabel: "Beds",
      value: formatSpecRange(specs.minBedrooms, specs.maxBedrooms, { separator }),
      icon: BedDouble,
    },
    {
      label: "Bathrooms",
      compactLabel: "Baths",
      value: formatSpecRange(specs.minBathrooms, specs.maxBathrooms, { separator }),
      icon: Bath,
    },
    {
      label: "Size (sqft)",
      compactLabel: "sqft",
      value: formatSpecRange(specs.minSqft, specs.maxSqft, {
        separator,
        preferMinimum: isCompact,
      }),
      icon: Ruler,
    },
  ];

  if (!isCompact) {
    tiles.push({
      label: "Tenure",
      compactLabel: "Tenure",
      value: specs.tenure || "Freehold",
      icon: Calendar,
    });
  }

  return (
    <div
      className={cn(
        isCompact
          ? "border-border my-2 grid grid-cols-3 gap-2 border-y py-3"
          : "grid grid-cols-2 gap-6 md:grid-cols-4",
        className,
      )}
    >
      {tiles.map((tile, index) => {
        const Icon = tile.icon;

        return (
          <div
            key={tile.label}
            className={cn(
              isCompact
                ? "flex flex-col items-center justify-center gap-1 text-center"
                : "bg-muted/50 flex flex-col items-center justify-center rounded-lg p-4",
              isCompact && index > 0 && "border-border border-l",
            )}
          >
            <Icon className={isCompact ? "text-accent h-4 w-4" : "text-primary mb-2 h-6 w-6"} />
            {!isCompact && <span className="text-muted-foreground text-sm">{tile.label}</span>}
            <span className={isCompact ? "text-xs font-medium" : "text-lg font-semibold"}>
              {isCompact ? `${tile.value} ${tile.compactLabel}` : tile.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
