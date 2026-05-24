import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReferralCodeInput } from "@/components/auth/shared/ReferralCodeInput";

describe("ReferralCodeInput", () => {
  it("renders the default optional label and disables apply when empty", () => {
    render(<ReferralCodeInput inputProps={{ name: "referralCode" }} onApply={vi.fn()} />);

    expect(screen.getByText("Referral Code (Optional)")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Apply" }).hasAttribute("disabled")).toBe(true);
  });

  it("supports a required label, error text, and apply action", () => {
    const onApply = vi.fn();

    render(
      <ReferralCodeInput
        label="Referral Code"
        inputProps={{ name: "referralCode" }}
        value="ABC123"
        onApply={onApply}
        error="Please enter a code"
      />,
    );

    expect(screen.getByText("Referral Code")).toBeTruthy();
    expect(screen.getByText("Please enter a code")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledTimes(1);
  });
});
