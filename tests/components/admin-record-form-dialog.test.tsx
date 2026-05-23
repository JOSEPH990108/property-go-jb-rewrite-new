import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminRecordFormDialog } from "@/components/admin/shared/AdminRecordFormDialog";

describe("AdminRecordFormDialog", () => {
  it("renders create mode content and invokes actions", () => {
    const onOpenChange = vi.fn();
    const onCancel = vi.fn();
    const onSave = vi.fn();

    render(
      <AdminRecordFormDialog
        open
        onOpenChange={onOpenChange}
        mode="create"
        entityLabel="Property Categories"
        onCancel={onCancel}
        onSave={onSave}
      >
        <label htmlFor="name">Name</label>
        <input id="name" />
      </AdminRecordFormDialog>,
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Create Property Categories Record" })).toBeTruthy();
    expect(screen.getByLabelText("Name")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("renders edit mode with loading state", () => {
    render(
      <AdminRecordFormDialog
        open
        onOpenChange={vi.fn()}
        mode="edit"
        entityLabel="Property Categories"
        onCancel={vi.fn()}
        onSave={vi.fn()}
        isSaving
      >
        <span>Form fields</span>
      </AdminRecordFormDialog>,
    );

    const saveButton = screen.getByRole<HTMLButtonElement>("button", { name: /Save Changes/i });

    expect(screen.getByRole("heading", { name: "Edit Property Categories Record" })).toBeTruthy();
    expect(saveButton.disabled).toBe(true);
  });
});
