import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AdminDashboardData } from "@/app/actions/admin-actions";
import {
  AgentInspector,
  DeveloperInspector,
  MiniMetric,
  PropertyInspector,
} from "@/components/admin/portal/EntityInspectors";

type PropertyRow = AdminDashboardData["properties"][number];
type AgentRow = AdminDashboardData["agents"][number];
type DeveloperRow = AdminDashboardData["lookups"]["developers"][number];

const property = {
  id: "property-1",
  name: "Vistara Hills",
  slug: "vistara-hills",
  developerName: "Acme Development",
  isPublished: true,
  categoryName: "Landed",
  typeName: "Terrace",
  regionName: "Johor Bahru",
  areaName: "Tebrau",
  tenureTypeId: "freehold",
  address: "Jalan Example",
  description: "A family-friendly landed project.",
  totalUnits: 120,
  launchYear: 2026,
  statusName: "Active",
} as PropertyRow;

const agent = {
  id: "agent-1",
  name: "Sarah Tan",
  email: "sarah@example.com",
  phoneNumber: "+60123456789",
  agencyName: "Prime Realty",
  renNumber: "REN12345",
  image: "https://example.com/avatar.jpg",
} as AgentRow;

const developer = {
  id: "developer-1",
  name: "Acme Development",
  slug: "acme-development",
  legalName: "Acme Development Sdn Bhd",
  countryCode: "MY",
  description: "Developer profile.",
  isFeatured: true,
  isActive: true,
} as DeveloperRow;

describe("admin portal inspectors", () => {
  it("renders a mini metric", () => {
    render(<MiniMetric label="Listings" value="12" note="Assigned projects" />);

    expect(screen.getByText("Listings")).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("Assigned projects")).toBeTruthy();
  });

  it("renders property details and invokes actions", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<PropertyInspector property={property} onEdit={onEdit} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: /Edit Listing/i }));
    fireEvent.click(screen.getByRole("button", { name: /Delete/i }));

    expect(screen.getByText("Vistara Hills")).toBeTruthy();
    expect(screen.getByText("Landed / Terrace")).toBeTruthy();
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("renders agent details, metrics, and empty state", () => {
    render(
      <AgentInspector
        agent={agent}
        stats={[{ label: "Coverage", value: "8", note: "Linked projects" }]}
      />,
    );

    expect(screen.getByText("Sarah Tan")).toBeTruthy();
    expect(screen.getByText("REN12345")).toBeTruthy();
    expect(screen.getByText("Coverage")).toBeTruthy();

    render(<AgentInspector agent={null} stats={[]} />);

    expect(screen.getByText("No agent selected")).toBeTruthy();
  });

  it("renders developer details and invokes actions", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<DeveloperInspector developer={developer} onEdit={onEdit} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: /Edit Developer/i }));
    fireEvent.click(screen.getByRole("button", { name: /Delete/i }));

    expect(screen.getByText("Acme Development")).toBeTruthy();
    expect(screen.getByText("Acme Development Sdn Bhd")).toBeTruthy();
    expect(screen.getByText("Active")).toBeTruthy();
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
