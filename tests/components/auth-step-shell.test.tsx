import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthStepShell } from "@/components/auth/shared/AuthStepShell";

describe("AuthStepShell", () => {
  it("renders a default auth step with a back link", () => {
    render(
      <AuthStepShell title="Sign In" description="Sign in with your phone number.">
        <button type="button">Continue</button>
      </AuthStepShell>,
    );

    expect(screen.getByRole("heading", { name: "Sign In" })).toBeTruthy();
    expect(screen.getByText("Sign in with your phone number.")).toBeTruthy();
    expect(screen.getByRole("link", { name: /back to main/i }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("button", { name: "Continue" })).toBeTruthy();
  });

  it("renders a centered modal step without the page back link", () => {
    render(
      <AuthStepShell title="What's your name?" isModal variant="centered">
        <input aria-label="Full Name" />
      </AuthStepShell>,
    );

    expect(screen.getByRole("heading", { name: "What's your name?" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /back to main/i })).toBeNull();
    expect(screen.getByLabelText("Full Name")).toBeTruthy();
  });
});
