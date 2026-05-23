import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AdminDashboardData } from "@/app/actions/admin-actions";
import {
  AgentFormFields,
  DeveloperFormFields,
  PropertyFormFields,
  type AgentFormState,
  type DeveloperFormState,
  type PropertyFormState,
} from "@/components/admin/forms/AdminPortalFormFields";

const lookups = {
  developers: [{ id: "developer-1", name: "Acme Development" }],
  tenures: [{ id: "tenure-1", name: "Freehold" }],
  categories: [{ id: "category-1", name: "Landed" }],
  types: [{ id: "type-1", name: "Terrace", categoryId: "category-1" }],
  statuses: [{ id: "status-1", name: "Active" }],
  regions: [{ id: "region-1", name: "Johor Bahru" }],
  areas: [{ id: "area-1", name: "Tebrau", regionId: "region-1" }],
} as AdminDashboardData["lookups"];

const propertyForm: PropertyFormState = {
  name: "Vistara Hills",
  slug: "vistara-hills",
  description: "Landed project",
  address: "Jalan Example",
  launchYear: "2026",
  totalUnits: "120",
  isPublished: false,
  developerId: "developer-1",
  propertyCategoryId: "category-1",
  propertyTypeId: "type-1",
  projectStatusId: "status-1",
  tenureTypeId: "tenure-1",
  regionId: "region-1",
  areaId: "area-1",
};

const agentForm: AgentFormState = {
  name: "Sarah Tan",
  email: "sarah@example.com",
  phoneNumber: "+60123456789",
  agencyName: "Prime Realty",
  renNumber: "REN12345",
  image: "https://example.com/avatar.jpg",
};

const developerForm: DeveloperFormState = {
  name: "Acme Development",
  slug: "acme-development",
  description: "Developer profile",
  legalName: "Acme Development Sdn Bhd",
  countryCode: "MY",
  isFeatured: false,
};

function PropertyFormHarness() {
  const [form, setForm] = useState(propertyForm);

  return (
    <PropertyFormFields
      form={form}
      setForm={setForm}
      lookups={lookups}
      filteredTypes={lookups.types}
      filteredAreas={lookups.areas}
    />
  );
}

function AgentFormHarness() {
  const [form, setForm] = useState(agentForm);

  return <AgentFormFields form={form} setForm={setForm} />;
}

function DeveloperFormHarness() {
  const [form, setForm] = useState(developerForm);

  return <DeveloperFormFields form={form} setForm={setForm} />;
}

describe("admin portal form fields", () => {
  it("renders property taxonomy fields and updates controlled text inputs", () => {
    render(<PropertyFormHarness />);

    fireEvent.change(screen.getByDisplayValue("Vistara Hills"), {
      target: { value: "Vistara Heights" },
    });

    expect(screen.getByText("Property name")).toBeTruthy();
    expect(screen.getByText("Category")).toBeTruthy();
    expect(screen.getByText("Region")).toBeTruthy();
    expect(screen.getByDisplayValue("Vistara Heights")).toBeTruthy();
  });

  it("renders agent roster inputs and updates controlled text inputs", () => {
    render(<AgentFormHarness />);

    fireEvent.change(screen.getByDisplayValue("Sarah Tan"), {
      target: { value: "Daniel Lim" },
    });

    expect(screen.getByText("Agent name")).toBeTruthy();
    expect(screen.getByText("REN number")).toBeTruthy();
    expect(screen.getByDisplayValue("Daniel Lim")).toBeTruthy();
  });

  it("renders developer entity inputs and updates controlled text inputs", () => {
    render(<DeveloperFormHarness />);

    fireEvent.change(screen.getByDisplayValue("Acme Development"), {
      target: { value: "Meridian Homes" },
    });

    expect(screen.getByText("Developer name")).toBeTruthy();
    expect(screen.getByText("Featured")).toBeTruthy();
    expect(screen.getByDisplayValue("Meridian Homes")).toBeTruthy();
  });
});
