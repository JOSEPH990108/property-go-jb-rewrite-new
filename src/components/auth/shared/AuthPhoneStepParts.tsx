"use client";

import Link from "next/link";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type AuthMethodDividerProps = {
  label?: string;
};

export function AuthMethodDivider({ label = "Or with Phone" }: AuthMethodDividerProps) {
  return (
    <div className="text-muted-foreground relative py-2 text-center text-sm">
      <span className="bg-background relative z-10 px-2">{label}</span>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t" />
      </div>
    </div>
  );
}

type RememberMeCheckboxProps = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
};

export function RememberMeCheckbox({
  id,
  checked,
  onCheckedChange,
  label = "Keep me logged in",
}: RememberMeCheckboxProps) {
  return (
    <div className="flex items-center space-x-2 py-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value as boolean)}
      />
      <Label htmlFor={id} className="text-muted-foreground cursor-pointer text-sm font-normal">
        {label}
      </Label>
    </div>
  );
}

type AuthModeSwitchProps = {
  prompt: string;
  actionLabel: string;
  href: string;
  isModal?: boolean;
  onModalSwitch: () => void;
};

export function AuthModeSwitch({
  prompt,
  actionLabel,
  href,
  isModal = false,
  onModalSwitch,
}: AuthModeSwitchProps) {
  return (
    <div className="text-muted-foreground text-center text-sm">
      {prompt}{" "}
      {isModal ? (
        <button
          type="button"
          onClick={onModalSwitch}
          className="text-primary font-medium hover:underline focus:outline-none"
        >
          {actionLabel}
        </button>
      ) : (
        <Link href={href} className="text-primary font-medium">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
