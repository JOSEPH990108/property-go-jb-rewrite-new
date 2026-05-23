"use client";

import type { KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import type { AdminDashboardData } from "@/app/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PropertyRow = AdminDashboardData["properties"][number];
type AgentRow = AdminDashboardData["agents"][number];
type DeveloperRow = AdminDashboardData["lookups"]["developers"][number];

function handleKeyboardSelect(event: KeyboardEvent<HTMLDivElement>, onSelect: () => void) {
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  onSelect();
}

interface MiniPropertyRowProps {
  property: PropertyRow;
  onClick: () => void;
}

export function MiniPropertyRow({ property, onClick }: MiniPropertyRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border bg-secondary hover:bg-card flex items-center justify-between rounded-[22px] border p-4 text-left transition duration-200"
    >
      <div>
        <div className="font-lato text-foreground font-semibold">{property.name}</div>
        <div className="text-muted-foreground mt-1 text-sm">{property.developerName}</div>
      </div>
      <Badge variant={property.isPublished ? "accent" : "outline"}>
        {property.isPublished ? "Published" : "Draft"}
      </Badge>
    </button>
  );
}

interface PropertyCardProps {
  property: PropertyRow;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}

export function PropertyCard({
  property,
  selected,
  onSelect,
  onEdit,
  onDelete,
  index,
}: PropertyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.2), duration: 0.24 }}
      whileHover={{ y: -4 }}
      onClick={onSelect}
      className={cn(
        "group cursor-pointer overflow-hidden rounded-[24px] border text-left shadow-md transition-all duration-300 hover:shadow-xl",
        selected
          ? "border-primary/60 from-primary/15 to-primary/5 ring-primary/30 ring-offset-card bg-gradient-to-br ring-2 ring-offset-2"
          : "border-border/50 from-card/70 to-card/40 hover:border-primary/40 bg-gradient-to-br backdrop-blur-sm",
      )}
    >
      <div className="from-primary/10 via-accent/5 to-secondary/5 relative h-40 overflow-hidden bg-gradient-to-br">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/shape/grid-01.svg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.12] transition-opacity duration-300 group-hover:opacity-[0.18]"
        />
        <div className="to-card/20 absolute inset-0 bg-gradient-to-br from-transparent via-transparent" />
        <div className="from-card/90 to-card/20 absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t backdrop-blur-sm" />
        <div className="absolute top-3 right-3 transition-transform duration-300 group-hover:scale-110">
          <Badge
            className={cn(
              "rounded-full px-3 py-1 text-[10px] font-semibold shadow-md",
              property.isPublished
                ? "border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                : "border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white",
            )}
          >
            {property.isPublished ? "Live" : "Draft"}
          </Badge>
        </div>
        {property.categoryName && (
          <div className="absolute bottom-3 left-3 transition-transform duration-300 group-hover:scale-105">
            <span className="bg-card/80 text-foreground border-border/30 rounded-full border px-3 py-1.5 text-[11px] font-semibold backdrop-blur-md">
              {property.categoryName}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-lato text-foreground line-clamp-2 text-[15px] leading-tight font-bold tracking-[-0.02em]">
              {property.name}
            </h4>
            <p className="text-muted-foreground/70 mt-1 text-xs font-medium">/{property.slug}</p>
          </div>
        </div>

        <div className="text-muted-foreground mb-4 flex flex-wrap items-center gap-2 text-xs">
          {property.regionName && (
            <span className="bg-secondary/50 inline-flex items-center gap-1 rounded-full px-2.5 py-1 backdrop-blur-sm">
              <MapPin className="h-3 w-3" />
              {property.regionName}
            </span>
          )}
          {property.totalUnits ? (
            <span className="bg-secondary/50 inline-flex items-center gap-1 rounded-full px-2.5 py-1">
              {property.totalUnits} units
            </span>
          ) : null}
          {property.launchYear ? (
            <span className="bg-secondary/50 inline-flex items-center gap-1 rounded-full px-2.5 py-1">
              {property.launchYear}
            </span>
          ) : null}
        </div>

        <div className="border-border/30 flex items-center justify-between border-t pt-3">
          <span className="text-muted-foreground/60 text-xs font-medium">
            {property.statusName ?? "—"}
          </span>
          <div className="flex gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={`Edit ${property.name}`}
                className="border-border/50 bg-secondary/50 hover:bg-secondary/80 rounded-lg shadow-none"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="destructive"
                size="icon-sm"
                aria-label={`Delete ${property.name}`}
                className="rounded-lg shadow-none hover:shadow-md"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface AgentListCardProps {
  agent: AgentRow;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}

export function AgentListCard({
  agent,
  selected,
  onSelect,
  onEdit,
  onDelete,
  index,
}: AgentListCardProps) {
  return (
    <motion.div
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.18), duration: 0.24 }}
      onClick={onSelect}
      onKeyDown={(event) => handleKeyboardSelect(event, onSelect)}
      className={cn(
        "cursor-pointer",
        "rounded-[26px] border p-4 text-left transition duration-200",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-md"
          : "border-border bg-secondary text-foreground hover:bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-lato text-lg font-semibold tracking-[-0.03em]">{agent.name}</div>
          <div
            className={cn(
              "text-muted-foreground mt-1 text-sm",
              selected && "text-primary-foreground/65",
            )}
          >
            {agent.email}
          </div>
          <div
            className={cn(
              "mt-3 flex flex-wrap gap-2 text-sm",
              selected ? "text-primary-foreground/72" : "text-foreground/72",
            )}
          >
            <span>{agent.agencyName ?? "No agency"}</span>
            <span>•</span>
            <span>{agent.renNumber ?? "REN missing"}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={selected ? "secondary" : "outline"}
            size="icon-sm"
            aria-label={`Edit ${agent.name}`}
            className={cn(
              selected &&
                "border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25",
            )}
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="destructive"
            size="icon-sm"
            aria-label={`Delete ${agent.name}`}
            className="shadow-none"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

interface DeveloperListCardProps {
  developer: DeveloperRow;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}

export function DeveloperListCard({
  developer,
  selected,
  onSelect,
  onEdit,
  onDelete,
  index,
}: DeveloperListCardProps) {
  return (
    <motion.div
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.18), duration: 0.24 }}
      onClick={onSelect}
      onKeyDown={(event) => handleKeyboardSelect(event, onSelect)}
      className={cn(
        "cursor-pointer",
        "rounded-[26px] border p-4 text-left transition duration-200",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-md"
          : "border-border bg-secondary text-foreground hover:bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-lato text-lg font-semibold tracking-[-0.03em]">
              {developer.name}
            </span>
            {developer.isFeatured && (
              <Badge
                variant="accent"
                className={cn(
                  selected &&
                    "border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground",
                )}
              >
                Featured
              </Badge>
            )}
          </div>
          <p
            className={cn(
              "text-muted-foreground mt-1 text-sm",
              selected && "text-primary-foreground/65",
            )}
          >
            /{developer.slug}
          </p>
          <div
            className={cn(
              "mt-3 flex flex-wrap gap-2 text-sm",
              selected ? "text-primary-foreground/72" : "text-foreground/72",
            )}
          >
            <span>{developer.legalName ?? "No legal name"}</span>
            {developer.countryCode && (
              <>
                <span>•</span>
                <span>{developer.countryCode}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={selected ? "secondary" : "outline"}
            size="icon-sm"
            aria-label={`Edit ${developer.name}`}
            className={cn(
              selected &&
                "border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25",
            )}
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="destructive"
            size="icon-sm"
            aria-label={`Delete ${developer.name}`}
            className="shadow-none"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
