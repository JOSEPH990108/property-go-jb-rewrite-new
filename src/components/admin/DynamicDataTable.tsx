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
          .includes(search),
      );
    },
  });

  return (
    <>
      <section className="border-border bg-card/95 rounded-[28px] border p-5 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur-md">
        <div className="border-border flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-primary/80 text-xs tracking-[0.24em] uppercase">
              Reusable CRUD table
            </p>
            <h2 className="text-foreground mt-2 text-2xl font-semibold">{title}</h2>
            <p className="text-foreground/70 mt-1 text-sm">{description}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onAddNew}
              className="border-primary/20 from-primary to-accent text-primary-foreground inline-flex items-center justify-center gap-2 rounded-2xl border bg-gradient-to-r px-4 py-3 text-sm font-semibold shadow-[0_0_32px_hsl(var(--primary)/0.3)] transition hover:shadow-[0_0_40px_hsl(var(--primary)/0.4)]"
            >
              <Plus className="h-4 w-4" />
              {addLabel}
            </button>

            <label className="border-border bg-background text-foreground/70 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm">
              <Search className="text-primary h-4 w-4" />
              <input
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                placeholder="Search records..."
                className="text-foreground placeholder:text-foreground/45 w-full bg-transparent text-sm outline-none sm:min-w-64"
              />
            </label>
          </div>
        </div>

        <div className="border-border bg-background mt-5 overflow-hidden rounded-[24px] border">
          <div className="overflow-x-auto">
            <table className="divide-border text-foreground min-w-full divide-y text-left text-sm">
              <thead className="bg-muted/35 text-foreground/60 text-xs tracking-[0.24em] uppercase">
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
              <tbody className="divide-border/70 divide-y">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-foreground/60 px-4 py-10 text-center text-sm"
                    >
                      No records match the current search.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRow(row.original)}
                      className="hover:bg-primary/8 cursor-pointer transition"
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
              className="bg-background/70 fixed inset-0 z-40"
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
              className="border-border bg-card fixed top-0 right-0 z-50 flex h-full w-full max-w-xl flex-col border-l p-6 shadow-[0_0_60px_rgba(15,23,42,0.2)] backdrop-blur-xl"
            >
              <div className="border-border flex items-center justify-between border-b pb-4">
                <div>
                  <p className="text-primary/80 text-xs tracking-[0.24em] uppercase">Row details</p>
                  <h3 className="text-foreground mt-2 text-2xl font-semibold">Update drawer</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRow(null)}
                  className="border-border bg-background text-foreground hover:bg-muted/30 inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition"
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
                        className="border-border bg-background rounded-2xl border px-4 py-3"
                      >
                        <p className="text-foreground/60 text-xs tracking-[0.2em] uppercase">
                          {key}
                        </p>
                        <p className="text-foreground mt-2 text-sm font-medium">
                          {String(value ?? "-")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="border-primary/20 bg-primary/10 text-primary rounded-2xl border px-4 py-3 text-sm font-medium"
                >
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRow(null)}
                  className="border-border bg-background text-foreground rounded-2xl border px-4 py-3 text-sm font-medium"
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
