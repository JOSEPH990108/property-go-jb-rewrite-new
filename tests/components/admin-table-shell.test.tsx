import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminTableShell } from "@/components/admin/shared/AdminTableShell";

describe("AdminTableShell", () => {
  it("renders toolbar, table content, and pagination slot", () => {
    render(
      <AdminTableShell
        toolbar={<div>Records toolbar</div>}
        pagination={<nav aria-label="Table pagination">Page 1 of 3</nav>}
      >
        <table>
          <tbody>
            <tr>
              <td>Property Categories</td>
            </tr>
          </tbody>
        </table>
      </AdminTableShell>,
    );

    expect(screen.getByText("Records toolbar")).toBeTruthy();
    expect(screen.getByText("Property Categories")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Table pagination" })).toBeTruthy();
  });
});
