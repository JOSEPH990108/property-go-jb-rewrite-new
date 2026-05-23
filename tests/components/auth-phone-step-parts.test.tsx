import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  AuthMethodDivider,
  AuthModeSwitch,
  RememberMeCheckbox,
} from "@/components/auth/shared/AuthPhoneStepParts";

describe("auth phone step parts", () => {
  it("renders the auth method divider label", () => {
    render(<AuthMethodDivider />);

    expect(screen.getByText("Or with Phone")).toBeTruthy();
  });

  it("passes remember-me changes to the parent", () => {
    const onCheckedChange = vi.fn();

    render(<RememberMeCheckbox id="remember" checked={false} onCheckedChange={onCheckedChange} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Keep me logged in" }));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("renders a link switch for page auth and a button switch for modal auth", () => {
    const onModalSwitch = vi.fn();
    const { rerender } = render(
      <AuthModeSwitch
        prompt="Already have an account?"
        actionLabel="Sign In"
        href="/signin"
        onModalSwitch={onModalSwitch}
      />,
    );

    expect(screen.getByRole("link", { name: "Sign In" }).getAttribute("href")).toBe("/signin");

    rerender(
      <AuthModeSwitch
        prompt="Already have an account?"
        actionLabel="Sign In"
        href="/signin"
        isModal
        onModalSwitch={onModalSwitch}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    expect(onModalSwitch).toHaveBeenCalledTimes(1);
  });
});
