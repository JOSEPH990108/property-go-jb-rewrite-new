import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  ActionCard,
  HighlightPanel,
  MetricCard,
  OperationsStrip,
  PortfolioMixChart,
  SurfaceCard,
} from "@/components/admin/portal/OverviewPanels";

describe("admin portal overview panels", () => {
  it("renders metric and surface card content", () => {
    render(
      <SurfaceCard title="Portfolio" description="Overview panel">
        <MetricCard label="Properties" value="12" note="Active listings" accent="blue" />
      </SurfaceCard>,
    );

    expect(screen.getByText("Portfolio")).toBeTruthy();
    expect(screen.getByText("Overview panel")).toBeTruthy();
    expect(screen.getByText("Properties")).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
  });

  it("renders operations progress and invokes the scenario action", () => {
    const onScenario = vi.fn();

    render(
      <OperationsStrip
        operationsValue={6}
        operationsTarget={12}
        transferValue={4}
        transferTarget={8}
        transferVolume={1200}
        onScenario={onScenario}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Upgrade/i }));

    expect(screen.getAllByText("50%")).toHaveLength(2);
    expect(screen.getByText("/1.2K units")).toBeTruthy();
    expect(onScenario).toHaveBeenCalledTimes(1);
  });

  it("renders portfolio chart rows and empty state", () => {
    render(<PortfolioMixChart rows={[{ label: "Landed", value: 8, width: "80%" }]} />);

    expect(screen.getByText("Statistics")).toBeTruthy();
    expect(screen.getByText("Landed")).toBeTruthy();
    expect(screen.getByText("2026")).toBeTruthy();

    render(<PortfolioMixChart rows={[]} />);

    expect(screen.getByText("No portfolio mix data yet.")).toBeTruthy();
  });

  it("invokes highlight and action card callbacks", () => {
    const onHighlight = vi.fn();
    const onAction = vi.fn();

    render(
      <>
        <HighlightPanel
          title="Automate launches"
          description="Scale the admin flow."
          actionLabel="Open Builder"
          onAction={onHighlight}
        />
        <ActionCard
          title="New property"
          description="Create a listing."
          actionLabel="Create"
          onClick={onAction}
        />
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Open Builder/i }));
    fireEvent.click(screen.getByRole("button", { name: /Create/i }));

    expect(screen.getByText("Automate launches")).toBeTruthy();
    expect(screen.getByText("New property")).toBeTruthy();
    expect(onHighlight).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
