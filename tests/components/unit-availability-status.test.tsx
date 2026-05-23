import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  getUnitStatusLabel,
  UnitAvailabilitySummary,
  UnitStatusBadge,
  UnitStatusLegend,
} from "@/components/properties/unit-availability/UnitAvailabilityStatus";
import type { TowerAvailability } from "@/lib/unit-chart-data";

const tower: TowerAvailability = {
  towerId: "tower-a",
  towerName: "Tower A",
  facingGroups: [],
  stacks: [],
  floors: [
    {
      kind: "residential",
      floor: 3,
      floorLabel: "03",
      cells: [
        {
          kind: "unit",
          unitNo: "03-01",
          status: "available",
          sqft: 850,
          price: 650000,
          facing: "city",
          layoutType: "A1",
        },
        {
          kind: "unit",
          unitNo: "03-02",
          status: "reserved",
          sqft: 900,
          price: 700000,
          facing: "city",
          layoutType: "A2",
        },
        { kind: "void" },
      ],
    },
    {
      kind: "residential",
      floor: 4,
      floorLabel: "04",
      cells: [
        {
          kind: "unit",
          unitNo: "04-01",
          status: "sold",
          sqft: 850,
          price: 690000,
          facing: "city",
          layoutType: "A1",
        },
      ],
    },
  ],
};

describe("unit availability status primitives", () => {
  it("maps unit statuses to readable labels", () => {
    expect(getUnitStatusLabel("reserved")).toBe("Reserved");
  });

  it("renders a unit status badge", () => {
    render(<UnitStatusBadge status="sold" />);

    expect(screen.getByText("Sold")).toBeTruthy();
  });

  it("renders status summary counts and legend", () => {
    render(
      <>
        <UnitAvailabilitySummary tower={tower} />
        <UnitStatusLegend />
      </>,
    );

    expect(screen.getByText("1 Available (33%)")).toBeTruthy();
    expect(screen.getByText("1 Reserved (33%)")).toBeTruthy();
    expect(screen.getByText("1 Sold (33%)")).toBeTruthy();
    expect(screen.getByText("3 total units")).toBeTruthy();
    expect(screen.getByText("Void / Not applicable")).toBeTruthy();
  });
});
