import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminTableToolbar } from "@/components/admin/shared/AdminTableToolbar";

describe("AdminTableToolbar", () => {
  it("renders the table heading, description, and default create action", () => {
    render(
      <AdminTableToolbar
        eyebrow="CRUD Table"
        title="Property Categories"
        description="Manage category lookup records."
        searchValue=""
        onSearchChange={vi.fn()}
        onCreate={vi.fn()}
      />,
    );

    expect(screen.getByText("CRUD Table")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Property Categories" })).toBeTruthy();
    expect(screen.getByText("Manage category lookup records.")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Add New/i })).toBeTruthy();
  });

  it("passes create and search interactions to callers", () => {
    const onCreate = vi.fn();
    const onSearchChange = vi.fn();

    render(
      <AdminTableToolbar
        eyebrow="Reusable CRUD table"
        title="Portfolio Records"
        searchValue=""
        onSearchChange={onSearchChange}
        createLabel="Create record"
        onCreate={onCreate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Create record/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /Search records/i }), {
      target: { value: "Johor" },
    });

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onSearchChange).toHaveBeenCalledWith("Johor");
  });

  it("renders custom actions in place of the default create button", () => {
    render(
      <AdminTableToolbar
        eyebrow="CRUD Table"
        title="Property Categories"
        searchValue=""
        onSearchChange={vi.fn()}
        actions={<button type="button">Import CSV</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Import CSV" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Add New/i })).toBeNull();
  });
});
