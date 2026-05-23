"use client";

import { Controller, type Control, type FieldError, type UseFormRegister } from "react-hook-form";

import { CountrySelect } from "@/components/custom/ui/CountrySelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PhoneFormData } from "@/types/auth.types";

type PhoneNumberFieldProps = {
  control: Control<PhoneFormData>;
  register: UseFormRegister<PhoneFormData>;
  error?: FieldError;
};

export function PhoneNumberField({ control, register, error }: PhoneNumberFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label>Phone Number*</Label>
      <div className="flex gap-2">
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <CountrySelect className="h-11" value={field.value} onChange={field.onChange} />
          )}
        />
        <Input
          type="tel"
          className="h-11 flex-1"
          {...register("phone")}
          placeholder="Phone Number"
        />
      </div>
      {error && <p className="text-destructive text-xs">{error.message}</p>}
    </div>
  );
}
