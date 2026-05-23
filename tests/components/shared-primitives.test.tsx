import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Check } from "lucide-react";
import { FieldInput, FieldSwitch } from "@/components/shared/FormFields";
import { FilterChip } from "@/components/shared/FilterChip";
import { SearchField } from "@/components/shared/SearchField";
import { StateBlock } from "@/components/shared/StateBlock";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SurfaceCard } from "@/components/shared/SurfaceCard";

describe("shared component primitives", () => {
  it("renders a surface card with title, description, action, and children", () => {
    render(
      <SurfaceCard
        title="Portfolio"
        description="Current summary"
        action={<button>Refresh</button>}
      >
        <p>Total units</p>
      </SurfaceCard>,
    );

    expect(screen.getByText("Portfolio")).toBeTruthy();
    expect(screen.getByText("Current summary")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Refresh" })).toBeTruthy();
    expect(screen.getByText("Total units")).toBeTruthy();
  });

  it("renders state block action and invokes the handler", () => {
    const onClick = vi.fn();

    render(
      <StateBlock
        title="No properties"
        description="Create a property to get started."
        action={{ label: "Create", onClick, icon: Check }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Create/i }));

    expect(screen.getByText("No properties")).toBeTruthy();
    expect(screen.getByText("Create a property to get started.")).toBeTruthy();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("maps common status values to readable labels", () => {
    render(<StatusBadge status="published" />);

    expect(screen.getByText("Published")).toBeTruthy();
  });

  it("supports controlled search input and clear action", () => {
    const onChange = vi.fn();

    render(<SearchField value="Johor" onChange={onChange} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Search" }), {
      target: { value: "Austin" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(onChange).toHaveBeenCalledWith("Austin");
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("marks filter chips as pressed when active", () => {
    render(<FilterChip active>Published</FilterChip>);

    expect(screen.getByRole("button", { name: "Published" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("renders field input helper and error states", () => {
    const onChange = vi.fn();

    render(
      <FieldInput
        label="Project name"
        value=""
        onChange={onChange}
        helperText="Use the public display name."
        error="Project name is required."
      />,
    );

    expect(screen.getByLabelText("Project name")).toBeTruthy();
    expect(screen.getByText("Project name is required.")).toBeTruthy();
  });

  it("renders field switch with enabled state", () => {
    const onChange = vi.fn();

    render(<FieldSwitch label="Published" checked onChange={onChange} />);

    expect(screen.getByText("Enabled")).toBeTruthy();
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
