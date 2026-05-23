"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

type AuthStepShellVariant = "default" | "centered";

type AuthStepShellProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  isModal?: boolean;
  variant?: AuthStepShellVariant;
  showBackLink?: boolean;
};

export function AuthStepShell({
  title,
  description,
  children,
  isModal = false,
  variant = "default",
  showBackLink = true,
}: AuthStepShellProps) {
  if (variant === "centered") {
    return (
      <div
        className={cn(
          "flex min-h-[500px] w-full flex-1 flex-col items-center justify-center",
          !isModal && "no-scrollbar overflow-y-auto lg:w-1/2",
        )}
      >
        <div className="mx-auto w-full max-w-md space-y-6 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">{title}</h1>
            {description && <p className="text-muted-foreground text-sm">{description}</p>}
          </div>

          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col",
        !isModal && "no-scrollbar overflow-y-auto lg:w-1/2",
      )}
    >
      <div className="mx-auto mb-5 w-full max-w-md px-4 sm:pt-10">
        {!isModal && showBackLink && (
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to main
          </Link>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-10">
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-2xl font-semibold">{title}</h1>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>

        {children}
      </div>
    </div>
  );
}
