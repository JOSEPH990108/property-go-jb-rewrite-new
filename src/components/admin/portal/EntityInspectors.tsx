"use client";

import type { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { AdminDashboardData } from "@/app/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StateBlock } from "@/components/shared/StateBlock";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

type PropertyRow = AdminDashboardData["properties"][number];
type AgentRow = AdminDashboardData["agents"][number];
type DeveloperRow = AdminDashboardData["lookups"]["developers"][number];

export interface InspectorMetric {
  label: string;
  value: string;
  note: string;
}

interface PortalSurfaceCardProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

function PortalSurfaceCard({ title, description, children, className }: PortalSurfaceCardProps) {
  return (
    <Card
      className={cn(
        "border-border/50 from-card/60 to-card/40 hover:border-border overflow-hidden rounded-[28px] border bg-gradient-to-br shadow-md backdrop-blur-xl transition-all duration-300 hover:shadow-lg",
        className,
      )}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-lato text-foreground text-lg font-semibold tracking-[-0.04em]">
              {title}
            </h3>
            <p className="text-muted-foreground/80 mt-1.5 text-sm leading-5">{description}</p>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function MiniMetric({ label, value, note }: InspectorMetric) {
  return (
    <div className="border-border bg-secondary rounded-[22px] border p-4">
      <div className="text-muted-foreground text-xs tracking-[0.22em] uppercase">{label}</div>
      <div className="font-lato text-foreground mt-3 text-3xl font-semibold tracking-[-0.05em]">
        {value}
      </div>
      <p className="text-muted-foreground mt-2 text-sm leading-6">{note}</p>
    </div>
  );
}

interface PropertyInspectorProps {
  property: PropertyRow | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PropertyInspector({ property, onEdit, onDelete }: PropertyInspectorProps) {
  return (
    <PortalSurfaceCard
      title="Property inspector"
      description="A focused detail view for the selected listing, tuned for quick QA before publishing."
      className="h-full"
    >
      {property ? (
        <div className="space-y-4">
          <div className="bg-primary text-primary-foreground rounded-[28px] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20 mb-3 rounded-full px-3 py-1 text-[11px] tracking-[0.22em] uppercase">
                  Selected Property
                </Badge>
                <h3 className="font-lato text-3xl font-semibold tracking-[-0.05em]">
                  {property.name}
                </h3>
                <p className="text-primary-foreground/65 mt-2 text-sm">/{property.slug}</p>
              </div>
              <StatusBadge status={property.isPublished ? "published" : "draft"} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InspectorStat label="Developer" value={property.developerName} />
              <InspectorStat
                label="Launch year"
                value={property.launchYear ? String(property.launchYear) : "Not set"}
              />
              <InspectorStat
                label="Units"
                value={property.totalUnits ? String(property.totalUnits) : "Not set"}
              />
              <InspectorStat label="Status" value={property.statusName ?? "No status"} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile
              title="Taxonomy"
              value={`${property.categoryName ?? "No category"} / ${property.typeName ?? "No type"}`}
            />
            <InfoTile
              title="Location"
              value={`${property.regionName ?? "No region"} / ${property.areaName ?? "No area"}`}
            />
            <InfoTile title="Tenure ID" value={property.tenureTypeId} />
            <InfoTile title="Address" value={property.address ?? "Address not provided"} />
          </div>

          <div className="border-border bg-secondary rounded-[24px] border p-4">
            <div className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Description
            </div>
            <p className="text-foreground/65 mt-3 text-sm leading-7">
              {property.description ?? "No description yet."}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary flex-1 rounded-full"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
              Edit Listing
            </Button>
            <Button variant="destructive" className="rounded-full" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <InspectorEmptyState
          title="No property selected"
          description="Choose a record from the roster to inspect its metadata and publishing state."
        />
      )}
    </PortalSurfaceCard>
  );
}

interface AgentInspectorProps {
  agent: AgentRow | null;
  stats: InspectorMetric[];
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AgentInspector({ agent, stats, onEdit, onDelete }: AgentInspectorProps) {
  return (
    <PortalSurfaceCard
      title="Agent inspector"
      description="Review a roster entry and tighten contact quality in one place."
      className="h-full"
    >
      {agent ? (
        <div className="space-y-4">
          <div className="bg-primary text-primary-foreground rounded-[28px] p-5">
            <Badge className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20 mb-3 rounded-full px-3 py-1 text-[11px] tracking-[0.22em] uppercase">
              Selected Agent
            </Badge>
            <h3 className="font-lato text-3xl font-semibold tracking-[-0.05em]">{agent.name}</h3>
            <p className="text-primary-foreground/65 mt-2 text-sm">{agent.email}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InspectorStat label="Phone" value={agent.phoneNumber ?? "Not set"} />
              <InspectorStat label="Agency" value={agent.agencyName ?? "Not set"} />
              <InspectorStat label="REN" value={agent.renNumber ?? "Missing"} />
              <InspectorStat label="Profile image" value={agent.image ? "Configured" : "Not set"} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {stats.map((item) => (
              <MiniMetric key={item.label} {...item} />
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary flex-1 rounded-full"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
              Edit Agent
            </Button>
            <Button variant="destructive" className="rounded-full" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <InspectorEmptyState
          title="No agent selected"
          description="Select a roster entry to review agency, REN, and communication data."
        />
      )}
    </PortalSurfaceCard>
  );
}

interface DeveloperInspectorProps {
  developer: DeveloperRow | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function DeveloperInspector({ developer, onEdit, onDelete }: DeveloperInspectorProps) {
  return (
    <PortalSurfaceCard
      title="Developer inspector"
      description="Review developer details, legal entity, and featured status."
      className="h-full"
    >
      {developer ? (
        <div className="space-y-4">
          <div className="bg-primary text-primary-foreground rounded-[28px] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20 mb-3 rounded-full px-3 py-1 text-[11px] tracking-[0.22em] uppercase">
                  Selected Developer
                </Badge>
                <h3 className="font-lato text-3xl font-semibold tracking-[-0.05em]">
                  {developer.name}
                </h3>
                <p className="text-primary-foreground/65 mt-2 text-sm">/{developer.slug}</p>
              </div>
              {developer.isFeatured && (
                <StatusBadge status="featured" label="Featured" tone="accent" />
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InspectorStat label="Legal name" value={developer.legalName ?? "Not set"} />
              <InspectorStat label="Country" value={developer.countryCode ?? "Not set"} />
              <InspectorStat label="Featured" value={developer.isFeatured ? "Yes" : "No"} />
              <InspectorStat label="Status" value={developer.isActive ? "Active" : "Inactive"} />
            </div>
          </div>

          <div className="border-border bg-secondary rounded-[24px] border p-4">
            <div className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Description
            </div>
            <p className="text-foreground/65 mt-3 text-sm leading-7">
              {developer.description ?? "No description yet."}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary flex-1 rounded-full"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
              Edit Developer
            </Button>
            <Button variant="destructive" className="rounded-full" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <InspectorEmptyState
          title="No developer selected"
          description="Select a developer from the directory to inspect their details."
        />
      )}
    </PortalSurfaceCard>
  );
}

function InspectorStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-primary-foreground/20 bg-primary-foreground/10 rounded-[22px] border p-4">
      <div className="text-primary-foreground/60 text-xs tracking-[0.22em] uppercase">{label}</div>
      <div className="text-primary-foreground mt-2 text-sm font-medium">{value}</div>
    </div>
  );
}

function InfoTile({ title, value }: { title: string; value: string }) {
  return (
    <div className="border-border bg-secondary rounded-[22px] border p-4">
      <div className="text-muted-foreground text-xs tracking-[0.22em] uppercase">{title}</div>
      <div className="font-lato text-foreground mt-2 text-sm leading-6 font-medium">{value}</div>
    </div>
  );
}

function InspectorEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <StateBlock
      title={title}
      description={description}
      density="compact"
      className="border-border bg-secondary rounded-[24px]"
    />
  );
}
