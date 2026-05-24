import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { OTPStep } from "@/components/auth/shared/OTPStep";

vi.mock("@/components/ui/input-otp", () => ({
  InputOTP: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  InputOTPGroup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  InputOTPSlot: ({ index }: { index: number }) => <span>Slot {index}</span>,
}));

describe("OTPStep", () => {
  it("renders OTP copy and keeps submit disabled until the code is complete", () => {
    render(
      <OTPStep
        phoneNumber="+60123456789"
        value="12345"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Verify Phone Number" })).toBeTruthy();
    expect(screen.getByText(/Enter the 6-digit code sent to/)).toBeTruthy();
    expect(screen.getByText("+60123456789")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Verify & Sign In" }).hasAttribute("disabled")).toBe(
      true,
    );
  });

  it("submits complete codes and invokes the back action", () => {
    const onSubmit = vi.fn();
    const onBack = vi.fn();

    render(
      <OTPStep
        phoneNumber="+60123456789"
        value="123456"
        onChange={vi.fn()}
        onSubmit={onSubmit}
        onBack={onBack}
        backLabel="Use another number"
        submitLabel="Verify Code"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));
    fireEvent.click(screen.getByRole("button", { name: "Use another number" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
