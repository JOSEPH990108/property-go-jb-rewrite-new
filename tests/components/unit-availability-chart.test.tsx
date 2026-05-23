import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UnitAvailabilityChart } from "@/components/properties/UnitAvailabilityChart";
import type { ProjectUnitChart } from "@/lib/unit-chart-data";

const chartData: ProjectUnitChart = {
  projectSlug: "vistara-hills",
  projectName: "Vistara Hills",
  isLiveData: true,
  towers: [
    {
      towerId: "tower-a",
      towerName: "Tower A",
      facingGroups: [{ key: "city", label: "City View", stackCount: 1 }],
      stacks: [{ stackNo: "01", layoutType: "A1", sqft: 850, facingGroupKey: "city" }],
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
          ],
        },
      ],
    },
  ],
};

describe("UnitAvailabilityChart", () => {
  it("shows selected unit details with a shared status badge", () => {
    render(<UnitAvailabilityChart data={chartData} />);

    fireEvent.click(screen.getByRole("button", { name: /03-01/i }));

    expect(screen.getByText("Unit 03-01")).toBeTruthy();
    expect(screen.getAllByText("Available").length).toBeGreaterThan(1);
    expect(screen.getByText("850 sqft")).toBeTruthy();
  });
});
