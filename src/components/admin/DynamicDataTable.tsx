"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, X } from "lucide-react";
type DynamicDataTableProps<TData extends Record<string, unknown>> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  title?: string;
  description?: string;
  addLabel?: string;
  onAddNew?: () => void;
  renderDrawerContent?: (row: TData) => React.ReactNode;
};

export function DynamicDataTable<TData extends Record<string, unknown>>({
  data,
  columns,
  title = "Portfolio Records",
  description = "Search, scan, and open records for quick updates.",
  addLabel = "Add New",
  onAddNew,
  renderDrawerContent,
}: DynamicDataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedRow, setSelectedRow] = useState<TData | null>(null);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).trim().toLowerCase();
      if (!search) return true;

      return Object.values(row.original).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(search)
      );
    },
  });

  return (
    <>
      <section className="rounded-[28px] border border-border bg-card/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur-md">
        <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary/80">Reusable CRUD table</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-foreground/70">{description}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_32px_hsl(var(--primary)/0.3)] transition hover:shadow-[0_0_40px_hsl(var(--primary)/0.4)]"
            >
              <Plus className="h-4 w-4" />
              {addLabel}
            </button>

            <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground/70">
              <Search className="h-4 w-4 text-primary" />
              <input
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                placeholder="Search records..."
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/45 sm:min-w-64"
              />
            </label>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[24px] border border-border bg-background">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-left text-sm text-foreground">
              <thead className="bg-muted/35 text-xs uppercase tracking-[0.24em] text-foreground/60">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-4 font-medium">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border/70">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-10 text-center text-sm text-foreground/60"
                    >
                      No records match the current search.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRow(row.original)}
                      className="cursor-pointer transition hover:bg-primary/8"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-4 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedRow ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-background/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRow(null)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-border bg-card p-6 shadow-[0_0_60px_rgba(15,23,42,0.2)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-primary/80">Row details</p>
                  <h3 className="mt-2 text-2xl font-semibold text-foreground">Update drawer</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRow(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-background text-foreground transition hover:bg-muted/30"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 flex-1 overflow-y-auto">
                {renderDrawerContent ? (
                  renderDrawerContent(selectedRow)
                ) : (
                  <div className="space-y-3">
                    {Object.entries(selectedRow).map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-2xl border border-border bg-background px-4 py-3"
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">{key}</p>
                        <p className="mt-2 text-sm font-medium text-foreground">{String(value ?? "-")}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
                >
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRow(null)}
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground"
                >
                  Cancel
                </button>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}