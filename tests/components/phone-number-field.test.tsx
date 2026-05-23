import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { PhoneNumberField } from "@/components/auth/shared/PhoneNumberField";
import type { PhoneFormData } from "@/types/auth.types";

function PhoneNumberFieldHarness() {
  const { control, register } = useForm<PhoneFormData>({
    defaultValues: { country: "MY", phone: "" },
  });

  return <PhoneNumberField control={control} register={register} />;
}

describe("PhoneNumberField", () => {
  it("renders country selection and phone input", () => {
    render(<PhoneNumberFieldHarness />);

    expect(screen.getByText("Phone Number*")).toBeTruthy();
    expect(screen.getByRole("combobox")).toBeTruthy();
    expect(screen.getByPlaceholderText("Phone Number")).toBeTruthy();
  });
});
