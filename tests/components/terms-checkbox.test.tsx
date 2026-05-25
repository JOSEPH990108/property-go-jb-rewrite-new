import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { TermsCheckbox } from "@/components/auth/shared/TermsCheckbox";

function TermsCheckboxHarness() {
  const [checked, setChecked] = useState(false);

  return <TermsCheckbox id="terms" checked={checked} onCheckedChange={setChecked} />;
}

describe("TermsCheckbox", () => {
  it("enables confirmation after the terms content is scrolled to the end", async () => {
    render(<TermsCheckboxHarness />);

    fireEvent.click(screen.getByRole("checkbox", { name: /terms of service/i }));

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");

    const termsContent = screen.getByLabelText("Terms content");
    expect(termsContent.classList.contains("overscroll-contain")).toBe(true);
    expect(termsContent.hasAttribute("data-lenis-prevent-wheel")).toBe(true);

    Object.defineProperty(termsContent, "clientHeight", { configurable: true, value: 200 });
    Object.defineProperty(termsContent, "scrollHeight", { configurable: true, value: 600 });

    const confirmButton = screen.getByRole("button", { name: "I Understand" });
    expect(confirmButton.hasAttribute("disabled")).toBe(true);

    fireEvent.scroll(termsContent, { target: { scrollTop: 400 } });

    await waitFor(() => {
      expect(confirmButton.hasAttribute("disabled")).toBe(false);
    });

    expect(termsContent.scrollTop).toBe(400);
  });
});
