"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DynamicDataTable } from "@/components/admin/DynamicDataTable";
import { developerRows, type DeveloperTableRow } from "@/lib/admin-mock-data";

const columns: ColumnDef<DeveloperTableRow>[] = [
  { header: "Developer", accessorKey: "name" },
  { header: "HQ", accessorKey: "headquarters" },
  { header: "Tier", accessorKey: "tier" },
  {
    header: "Featured",
    accessorKey: "featured",
    cell: ({ getValue }) => (
      <span className="rounded-full border border-accent/20 bg-accent/12 px-3 py-1 text-xs font-medium text-accent">
        {String(getValue())}
      </span>
    ),
  },
  { header: "Projects", accessorKey: "activeProjects" },
];

export default function DevelopersPage() {
  return (
    <DynamicDataTable
      data={developerRows}
      columns={columns}
      title="Developer Portfolio"
      description="Reusable CRUD view for developer records, featured placement, and active portfolio coverage."
      addLabel="Add New Developer"
    />
  );
}