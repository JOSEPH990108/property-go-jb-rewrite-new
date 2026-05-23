import { fireEvent, render, screen } from "@testing-library/react";
import { Calculator } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import {
  BreakdownRow,
  CalculatorMetricCard,
  CalculatorSection,
  CalculatorShell,
  SliderNumberField,
} from "@/components/shared/calculator/CalculatorPrimitives";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverStub;

describe("calculator primitives", () => {
  it("renders a calculator shell with heading and action", () => {
    render(
      <CalculatorShell
        title="Mortgage Calculator"
        description="Estimate repayment"
        icon={Calculator}
        action={<button type="button">Reset</button>}
      >
        <p>Calculator body</p>
      </CalculatorShell>,
    );

    expect(screen.getByRole("heading", { name: "Mortgage Calculator" })).toBeTruthy();
    expect(screen.getByText("Estimate repayment")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reset" })).toBeTruthy();
  });

  it("renders section, metric, and breakdown rows", () => {
    render(
      <CalculatorSection title="Loan Parameters" icon={Calculator}>
        <CalculatorMetricCard label="Estimated Monthly" value="RM 2,500">
          <BreakdownRow label="Total Interest" value="RM 100,000" highlight />
        </CalculatorMetricCard>
      </CalculatorSection>,
    );

    expect(screen.getByRole("heading", { name: "Loan Parameters" })).toBeTruthy();
    expect(screen.getByText("Estimated Monthly")).toBeTruthy();
    expect(screen.getByText("Total Interest")).toBeTruthy();
  });

  it("updates a slider number field through the numeric input", () => {
    const onChange = vi.fn();

    render(
      <SliderNumberField
        label="Property Price"
        value={500000}
        onChange={onChange}
        min={100000}
        max={3000000}
        step={10000}
        prefix="RM"
      />,
    );

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "600000" } });

    expect(onChange).toHaveBeenCalledWith(600000);
  });
});
