import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { PublicProject } from "@/app/actions/property-actions";
import { PropertyCard } from "@/components/properties/PropertyCard";

vi.mock("@/components/properties/FavoriteButton", () => ({
  FavoriteButton: () => <button type="button">Save to favorites</button>,
}));

const project = {
  id: "project-1",
  slug: "vistara-hills",
  name: "Vistara Hills",
  displayName: "Vistara Hills Residences",
  tagline: null,
  description: null,
  address: null,
  state: "Johor",
  developer: { name: "Acme Development", logo: null },
  category: "Residential",
  type: "Condominium",
  status: "New Launch",
  price: { min: 650000, max: 980000 },
  specs: {
    minBedrooms: 2,
    maxBedrooms: 3,
    minBathrooms: 2,
    maxBathrooms: 2,
    minSqft: 850,
    maxSqft: 1200,
    totalUnits: 220,
    tenure: "Freehold",
  },
  images: { featured: null, gallery: [] },
  amenities: [],
  tags: [],
  location: { lat: null, lng: null, area: "Tebrau", region: "Johor Bahru", state: "Johor" },
  isHotDeal: true,
  launchYear: 2026,
} as PublicProject;

describe("PropertyCard", () => {
  it("renders project status through the shared status badge", () => {
    render(<PropertyCard project={project} />);

    expect(screen.getByText("Vistara Hills Residences")).toBeTruthy();
    expect(screen.getByText("New Launch")).toBeTruthy();
    expect(screen.getByText("Hot Deal")).toBeTruthy();
    expect(screen.getByText("2-3 Beds")).toBeTruthy();
  });
});
