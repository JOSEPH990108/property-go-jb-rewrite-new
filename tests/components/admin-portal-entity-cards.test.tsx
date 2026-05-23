import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AdminDashboardData } from "@/app/actions/admin-actions";
import {
  AgentListCard,
  DeveloperListCard,
  MiniPropertyRow,
  PropertyCard,
} from "@/components/admin/portal/EntityListCards";

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
  regionName: "Johor Bahru",
  totalUnits: 120,
  launchYear: 2026,
  statusName: "Active",
} as PropertyRow;

const agent = {
  id: "agent-1",
  name: "Sarah Tan",
  email: "sarah@example.com",
  agencyName: "Prime Realty",
  renNumber: "REN12345",
} as AgentRow;

const developer = {
  id: "developer-1",
  name: "Acme Development",
  slug: "acme-development",
  legalName: "Acme Development Sdn Bhd",
  countryCode: "MY",
  isFeatured: true,
} as DeveloperRow;

describe("admin portal entity cards", () => {
  it("renders a mini property row and handles selection", () => {
    const onClick = vi.fn();

    render(<MiniPropertyRow property={property} onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: /Vistara Hills/i }));

    expect(screen.getByText("Acme Development")).toBeTruthy();
    expect(screen.getByText("Published")).toBeTruthy();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps property edit and delete actions separate from selection", () => {
    const onSelect = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <PropertyCard
        property={property}
        selected={false}
        onSelect={onSelect}
        onEdit={onEdit}
        onDelete={onDelete}
        index={0}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit Vistara Hills" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Vistara Hills" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renders agent metadata and action handlers", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <AgentListCard
        agent={agent}
        selected
        onSelect={vi.fn()}
        onEdit={onEdit}
        onDelete={onDelete}
        index={0}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit Sarah Tan" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Sarah Tan" }));

    expect(screen.getByText("sarah@example.com")).toBeTruthy();
    expect(screen.getByText("Prime Realty")).toBeTruthy();
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("renders developer featured state and action handlers", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <DeveloperListCard
        developer={developer}
        selected={false}
        onSelect={vi.fn()}
        onEdit={onEdit}
        onDelete={onDelete}
        index={0}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit Acme Development" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Acme Development" }));

    expect(screen.getByText("Featured")).toBeTruthy();
    expect(screen.getByText("Acme Development Sdn Bhd")).toBeTruthy();
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
