// src\components\custom\feature\tools\SelectionCard.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface SelectionCardProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  className?: string;
}

export const SelectionCard = ({
  active,
  onClick,
  icon,
  title,
  desc,
  className,
}: SelectionCardProps) => (
  <div
    onClick={onClick}
    className={cn(
      "group cursor-pointer rounded-2xl border-2 p-6 text-left transition-all",
      active
        ? "border-primary bg-primary/5 shadow-sm"
        : "border-border bg-card hover:border-primary/30 hover:shadow-sm",
      className,
    )}
  >
    <div
      className={cn(
        "mb-3 transition-colors [&>svg]:h-8 [&>svg]:w-8",
        active ? "text-primary" : "text-muted-foreground group-hover:text-primary/70",
      )}
    >
      {icon}
    </div>
    <h3
      className={cn("font-bold transition-colors", active ? "text-foreground" : "text-foreground")}
    >
      {title}
    </h3>
    <p className={cn("text-sm", active ? "text-muted-foreground" : "text-muted-foreground")}>
      {desc}
    </p>
  </div>
);
