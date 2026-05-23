import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminTableStateRow } from "@/components/admin/shared/AdminTableStateRow";

describe("AdminTableStateRow", () => {
  it("renders an empty table row with title and description", () => {
    render(
      <table>
        <tbody>
          <AdminTableStateRow
            colSpan={3}
            title="No records found."
            description="Try adjusting the current filters."
          />
        </tbody>
      </table>,
    );

    const cell = screen.getByRole("cell");

    expect(cell.getAttribute("colspan")).toBe("3");
    expect(screen.getByText("No records found.")).toBeTruthy();
    expect(screen.getByText("Try adjusting the current filters.")).toBeTruthy();
  });

  it("renders a loading table row", () => {
    render(
      <table>
        <tbody>
          <AdminTableStateRow colSpan={2} title="Loading records" tone="loading" />
        </tbody>
      </table>,
    );

    expect(screen.getByText("Loading records")).toBeTruthy();
    expect(screen.getByRole("cell").getAttribute("colspan")).toBe("2");
  });
});
