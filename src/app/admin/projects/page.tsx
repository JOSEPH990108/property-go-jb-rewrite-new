"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DynamicDataTable } from "@/components/admin/DynamicDataTable";
import { projectRows, type ProjectTableRow } from "@/lib/admin-mock-data";

const columns: ColumnDef<ProjectTableRow>[] = [
  { header: "Project", accessorKey: "name" },
  { header: "Location", accessorKey: "location" },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ getValue }) => (
      <span className="rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
        {String(getValue())}
      </span>
    ),
  },
  { header: "Available Units", accessorKey: "availableUnits" },
  { header: "Completion", accessorKey: "completion" },
];

export default function ProjectsPage() {
  return (
    <DynamicDataTable
      data={projectRows}
      columns={columns}
      title="Project Pipeline"
      description="Reusable CRUD view for project status, launch planning, and inventory availability."
      addLabel="Add New Project"
    />
  );
}