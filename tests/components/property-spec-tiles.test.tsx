import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PropertySpecTiles } from "@/components/properties/PropertySpecTiles";

const specs = {
  minBedrooms: 2,
  maxBedrooms: 3,
  minBathrooms: 2,
  maxBathrooms: 2,
  minSqft: 850,
  maxSqft: 1200,
  tenure: "Freehold",
};

describe("PropertySpecTiles", () => {
  it("renders compact listing specs", () => {
    render(<PropertySpecTiles specs={specs} variant="compact" />);

    expect(screen.getByText("2-3 Beds")).toBeTruthy();
    expect(screen.getByText("2 Baths")).toBeTruthy();
    expect(screen.getByText("850 sqft")).toBeTruthy();
  });

  it("renders detail specs with labels", () => {
    render(<PropertySpecTiles specs={specs} />);

    expect(screen.getByText("Bedrooms")).toBeTruthy();
    expect(screen.getByText("2 - 3")).toBeTruthy();
    expect(screen.getByText("Size (sqft)")).toBeTruthy();
    expect(screen.getByText("850 - 1200")).toBeTruthy();
    expect(screen.getByText("Freehold")).toBeTruthy();
  });
});
