"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DynamicDataTable } from "@/components/admin/DynamicDataTable";
import { agentRows, type AgentTableRow } from "@/lib/admin-mock-data";

const columns: ColumnDef<AgentTableRow>[] = [
  {
    header: "Agent",
    accessorKey: "name",
    cell: ({ row }) => (
      <div>
        <p className="text-foreground font-medium">{row.original.name}</p>
        <p className="text-muted-foreground mt-1 text-xs">{row.original.email}</p>
      </div>
    ),
  },
  { header: "Phone", accessorKey: "phone" },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ getValue }) => (
      <span className="border-primary/20 bg-primary/12 text-primary rounded-full border px-3 py-1 text-xs font-medium">
        {String(getValue())}
      </span>
    ),
  },
  { header: "Projects", accessorKey: "assignedProjects" },
];

export default function AgentsPage() {
  return (
    <DynamicDataTable
      data={agentRows}
      columns={columns}
      title="Agent Operations"
      description="Reusable CRUD view for agent management, assignment coverage, and contact updates."
      addLabel="Add New Agent"
    />
  );
}
