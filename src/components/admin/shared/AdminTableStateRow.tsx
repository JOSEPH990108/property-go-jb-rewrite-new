import { Loader2, SearchX } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminTableStateTone = "empty" | "loading";

interface AdminTableStateRowProps {
  colSpan: number;
  title: string;
  description?: string;
  tone?: AdminTableStateTone;
  className?: string;
}

export function AdminTableStateRow({
  colSpan,
  title,
  description,
  tone = "empty",
  className,
}: AdminTableStateRowProps) {
  const isLoading = tone === "loading";
  const Icon = isLoading ? Loader2 : SearchX;

  return (
    <tr>
      <td colSpan={colSpan} className={cn("px-4 py-10 text-center", className)}>
        <div className="text-foreground/60 mx-auto flex max-w-sm flex-col items-center gap-2 text-sm">
          <Icon className={cn("h-5 w-5", isLoading && "text-primary animate-spin")} />
          <p className="font-medium">{title}</p>
          {description && <p className="text-foreground/45 text-xs leading-5">{description}</p>}
        </div>
      </td>
    </tr>
  );
}
