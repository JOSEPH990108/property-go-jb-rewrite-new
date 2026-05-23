import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import DsrCalculatorLive from "@/components/custom/feature/tools/DSRCalculator";

describe("DsrCalculatorLive", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ rates: { MYR: 3.55 } }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the shared calculator shell and default results", async () => {
    render(<DsrCalculatorLive />);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    expect(screen.getByRole("heading", { name: "Loan Eligibility" })).toBeTruthy();
    expect(screen.getByText("Monthly Income (MYR)")).toBeTruthy();
    expect(screen.getByText("Debt Service Ratio")).toBeTruthy();
    expect(screen.getByText("Calculation Breakdown")).toBeTruthy();
  });
});
