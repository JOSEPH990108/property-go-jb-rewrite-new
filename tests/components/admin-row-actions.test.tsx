import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminRowActions } from "@/components/admin/shared/AdminRowActions";

describe("AdminRowActions", () => {
  it("invokes edit and delete callbacks", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<AdminRowActions onEdit={onEdit} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: /Edit record/i }));
    fireEvent.click(screen.getByRole("button", { name: /Delete record/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("stops row click propagation", () => {
    const onRowClick = vi.fn();
    const onEdit = vi.fn();

    render(
      <div role="button" tabIndex={0} onClick={onRowClick}>
        <AdminRowActions onEdit={onEdit} onDelete={vi.fn()} />
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Edit record/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("disables unavailable actions", () => {
    render(<AdminRowActions />);

    expect(screen.getByRole<HTMLButtonElement>("button", { name: /Edit record/i }).disabled).toBe(
      true,
    );
    expect(screen.getByRole<HTMLButtonElement>("button", { name: /Delete record/i }).disabled).toBe(
      true,
    );
  });
});
