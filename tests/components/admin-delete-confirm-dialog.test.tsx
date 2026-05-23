import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminDeleteConfirmDialog } from "@/components/admin/shared/AdminDeleteConfirmDialog";

describe("AdminDeleteConfirmDialog", () => {
  it("renders default copy and invokes cancel and confirm actions", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <AdminDeleteConfirmDialog
        open
        onOpenChange={vi.fn()}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Delete Record" })).toBeTruthy();
    expect(screen.getByText(/This action cannot be undone/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("disables the confirm action while loading", () => {
    render(
      <AdminDeleteConfirmDialog
        open
        onOpenChange={vi.fn()}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        isLoading
      />,
    );

    expect(screen.getByRole<HTMLButtonElement>("button", { name: /Delete/i }).disabled).toBe(true);
  });
});
