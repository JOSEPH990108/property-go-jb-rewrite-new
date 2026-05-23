import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AdminTableShellProps {
  toolbar: ReactNode;
  children: ReactNode;
  pagination?: ReactNode;
  className?: string;
  tableFrameClassName?: string;
}

export function AdminTableShell({
  toolbar,
  children,
  pagination,
  className,
  tableFrameClassName,
}: AdminTableShellProps) {
  return (
    <section
      className={cn(
        "border-border bg-card/95 rounded-[28px] border p-5 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur-md",
        className,
      )}
    >
      {toolbar}

      <div
        className={cn(
          "border-border bg-background mt-5 overflow-hidden rounded-[24px] border",
          tableFrameClassName,
        )}
      >
        <div className="overflow-x-auto">{children}</div>
      </div>

      {pagination}
    </section>
  );
}
