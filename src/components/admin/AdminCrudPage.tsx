// src/components/admin/AdminCrudPage.tsx
"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  listTableRecords,
  getTableMeta,
  createTableRecord,
  updateTableRecord,
  deleteTableRecord,
  createJunctionRecord,
  deleteJunctionRecord,
  type TableListResult,
  type TableMetaResult,
  type ColumnMeta,
} from "@/app/actions/admin-crud-actions";
import { TABLE_REGISTRY, type ColumnOverride, type TableConfig } from "@/lib/admin-table-registry";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Props ────────────────────────────────────────────────────────────────────

type AdminCrudPageProps = {
  tableName: string;
};

// ── Main Component ───────────────────────────────────────────────────────────

export function AdminCrudPage({ tableName }: AdminCrudPageProps) {
  const config = TABLE_REGISTRY[tableName];

  const [data, setData] = useState<TableListResult | null>(null);
  const [meta, setMeta] = useState<TableMetaResult | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [isPending, startTransition] = useTransition();

  // Dialog state
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [deleteTarget, setDeleteTarget] = useState<Record<string, unknown> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── Data fetching ────────────────────────────────────────────────────────

  const fetchData = useCallback(() => {
    startTransition(async () => {
      const result = await listTableRecords(tableName, page, 50, searchDebounced);
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error);
      }
    });
  }, [tableName, page, searchDebounced]);

  const fetchMeta = useCallback(() => {
    startTransition(async () => {
      const result = await getTableMeta(tableName);
      if (result.success) {
        setMeta(result.data);
      }
    });
  }, [tableName]);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Table columns ────────────────────────────────────────────────────────

  const tableColumns: ColumnDef<Record<string, unknown>>[] = (() => {
    if (!meta) return [];

    const overrides = config?.columnOverrides ?? {};

    const visibleCols = meta.columns.filter((col) => {
      const ov = overrides[col.name];
      if (ov?.hidden) return false;
      if (ov?.tableHidden) return false;
      return true;
    });

    const cols: ColumnDef<Record<string, unknown>>[] = visibleCols.map((col) => {
      const ov = overrides[col.name];
      const fkOptions = ov?.foreignKey ? meta.foreignKeyOptions[col.name] : undefined;

      return {
        header: ov?.label ?? humanize(col.name),
        accessorKey: col.name,
        cell: ({ getValue }) => {
          const val = getValue();
          // FK resolution
          if (fkOptions && val) {
            const match = fkOptions.find((o) => o.value === String(val));
            if (match) return match.label;
          }
          // Booleans
          if (ov?.fieldType === "boolean" || typeof val === "boolean") {
            return (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  val
                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                    : "border border-zinc-400/20 bg-zinc-400/10 text-zinc-500"
                }`}
              >
                {val ? "Yes" : "No"}
              </span>
            );
          }
          // Enum select
          if (ov?.options && val) {
            const match = ov.options.find((o) => o.value === String(val));
            return (
              <span className="border-primary/20 bg-primary/10 text-primary rounded-full border px-2.5 py-1 text-xs font-medium">
                {match?.label ?? String(val)}
              </span>
            );
          }
          // Dates
          if ((ov?.fieldType === "date" || ov?.fieldType === "datetime") && val) {
            return formatDate(val);
          }
          // Truncate long text
          const str = val == null ? "—" : String(val);
          return str.length > 60 ? str.slice(0, 60) + "…" : str;
        },
      };
    });

    // Actions column
    cols.push({
      header: "",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row.original);
            }}
            className="text-foreground/60 hover:bg-primary/10 hover:text-primary inline-flex h-8 w-8 items-center justify-center rounded-xl transition"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row.original);
            }}
            className="text-foreground/60 hover:bg-destructive/10 hover:text-destructive inline-flex h-8 w-8 items-center justify-center rounded-xl transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    });

    return cols;
  })();

  const table = useReactTable({
    data: data?.records ?? [],
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ── Form helpers ─────────────────────────────────────────────────────────

  function openCreate() {
    setFormData({});
    setEditingRecord(null);
    setDialogMode("create");
  }

  function openEdit(record: Record<string, unknown>) {
    setFormData({ ...record });
    setEditingRecord(record);
    setDialogMode("edit");
  }

  function setField(key: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!config) return;
    setIsSaving(true);

    try {
      if (dialogMode === "create") {
        const result = config.compositePK
          ? await createJunctionRecord(tableName, formData)
          : await createTableRecord(tableName, formData);

        if (result.success) {
          toast.success("Record created");
          setDialogMode(null);
          fetchData();
        } else {
          toast.error(result.error);
        }
      } else if (dialogMode === "edit" && editingRecord) {
        const pkName = config.primaryKey ?? "id";
        const id = String(editingRecord[pkName]);
        const result = await updateTableRecord(tableName, id, formData);

        if (result.success) {
          toast.success("Record updated");
          setDialogMode(null);
          fetchData();
        } else {
          toast.error(result.error);
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!config || !deleteTarget) return;
    setIsSaving(true);

    try {
      let result;
      if (config.compositePK) {
        const keys: Record<string, string> = {};
        for (const k of config.compositePK) {
          keys[k] = String(deleteTarget[k]);
        }
        result = await deleteJunctionRecord(tableName, keys);
      } else {
        const pkName = config.primaryKey ?? "id";
        result = await deleteTableRecord(tableName, String(deleteTarget[pkName]));
      }

      if (result.success) {
        toast.success("Record deleted");
        setDeleteTarget(null);
        fetchData();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  }

  // ── Form fields for the dialog ───────────────────────────────────────────

  function getFormFields(): ColumnMeta[] {
    if (!meta) return [];
    const overrides = config?.columnOverrides ?? {};
    return meta.columns.filter((col) => {
      const ov = overrides[col.name];
      if (ov?.hidden) return false;
      if (ov?.formHidden) return false;
      if (ov?.readOnly) return false;
      return true;
    });
  }

  function renderFormField(col: ColumnMeta) {
    const ov = config?.columnOverrides?.[col.name];
    const label = ov?.label ?? humanize(col.name);
    const value = formData[col.name];
    const fieldType = ov?.fieldType ?? inferFieldType(col);

    // Select with options
    if (ov?.options) {
      return (
        <FieldWrapper key={col.name} label={label}>
          <Select
            value={value != null ? String(value) : undefined}
            onValueChange={(v) => setField(col.name, v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {ov.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>
      );
    }

    // FK dropdown
    if (ov?.foreignKey && meta?.foreignKeyOptions[col.name]) {
      const options = meta.foreignKeyOptions[col.name];
      return (
        <FieldWrapper key={col.name} label={label}>
          <Select
            value={value != null ? String(value) : undefined}
            onValueChange={(v) => setField(col.name, v === "__null__" ? null : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {!col.notNull && <SelectItem value="__null__">— None —</SelectItem>}
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>
      );
    }

    // Boolean toggle
    if (fieldType === "boolean") {
      return (
        <FieldWrapper key={col.name} label={label} row>
          <Switch
            checked={value === true || value === "true"}
            onCheckedChange={(checked) => setField(col.name, checked)}
          />
        </FieldWrapper>
      );
    }

    // Textarea
    if (fieldType === "textarea" || fieldType === "json") {
      return (
        <FieldWrapper key={col.name} label={label}>
          <Textarea
            value={value != null ? String(value) : ""}
            onChange={(e) => setField(col.name, e.target.value)}
            rows={3}
          />
        </FieldWrapper>
      );
    }

    // Number / Decimal
    if (fieldType === "number" || fieldType === "decimal") {
      return (
        <FieldWrapper key={col.name} label={label}>
          <Input
            type="number"
            step={fieldType === "decimal" ? "0.01" : "1"}
            value={value != null ? String(value) : ""}
            onChange={(e) => setField(col.name, e.target.value)}
          />
        </FieldWrapper>
      );
    }

    // Date
    if (fieldType === "date") {
      return (
        <FieldWrapper key={col.name} label={label}>
          <Input
            type="date"
            value={value != null ? String(value).slice(0, 10) : ""}
            onChange={(e) => setField(col.name, e.target.value)}
          />
        </FieldWrapper>
      );
    }

    // Datetime
    if (fieldType === "datetime") {
      return (
        <FieldWrapper key={col.name} label={label}>
          <Input
            type="datetime-local"
            value={value != null ? toDatetimeLocal(value) : ""}
            onChange={(e) => setField(col.name, e.target.value)}
          />
        </FieldWrapper>
      );
    }

    // Default text
    return (
      <FieldWrapper key={col.name} label={label}>
        <Input
          type="text"
          value={value != null ? String(value) : ""}
          onChange={(e) => setField(col.name, e.target.value)}
        />
      </FieldWrapper>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (!config) {
    return (
      <div className="text-foreground/60 flex h-64 items-center justify-center">
        Table &quot;{tableName}&quot; not found in registry.
      </div>
    );
  }

  return (
    <>
      {/* ── Data Table ─────────────────────────────────────────────────── */}
      <section className="border-border bg-card/95 rounded-[28px] border p-5 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur-md">
        {/* Header */}
        <div className="border-border flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-primary/80 text-xs tracking-[0.24em] uppercase">CRUD Table</p>
            <h2 className="text-foreground mt-2 text-2xl font-semibold">{config.label}</h2>
            {config.description && (
              <p className="text-foreground/70 mt-1 text-sm">{config.description}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={openCreate}
              className="border-primary/20 from-primary to-accent text-primary-foreground inline-flex items-center justify-center gap-2 rounded-2xl border bg-gradient-to-r px-4 py-3 text-sm font-semibold shadow-[0_0_32px_hsl(var(--primary)/0.3)] transition hover:shadow-[0_0_40px_hsl(var(--primary)/0.4)]"
            >
              <Plus className="h-4 w-4" />
              Add New
            </button>

            <label className="border-border bg-background text-foreground/70 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm">
              <Search className="text-primary h-4 w-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search records..."
                className="text-foreground placeholder:text-foreground/45 w-full bg-transparent text-sm outline-none sm:min-w-64"
              />
            </label>
          </div>
        </div>

        {/* Table */}
        <div className="border-border bg-background mt-5 overflow-hidden rounded-[24px] border">
          <div className="overflow-x-auto">
            <table className="divide-border text-foreground min-w-full divide-y text-left text-sm">
              <thead className="bg-muted/35 text-foreground/60 text-xs tracking-[0.24em] uppercase">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
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
                {isPending && !data ? (
                  <tr>
                    <td colSpan={tableColumns.length} className="px-4 py-10 text-center">
                      <Loader2 className="text-primary mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={tableColumns.length}
                      className="text-foreground/60 px-4 py-10 text-center text-sm"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-primary/5 transition">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3.5 align-middle">
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

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-foreground/60 text-sm">
              Showing {(data.page - 1) * data.limit + 1}–
              {Math.min(data.page * data.limit, data.total)} of {data.total}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="border-border bg-background text-foreground hover:bg-muted/50 inline-flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-foreground flex h-9 items-center px-3 text-sm">
                {data.page} / {data.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="border-border bg-background text-foreground hover:bg-muted/50 inline-flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Create / Edit Dialog ───────────────────────────────────────── */}
      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Create" : "Edit"} {config.label} Record
            </DialogTitle>
            <DialogDescription>Fill in the fields below and save.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 sm:grid-cols-2">
            {getFormFields().map(renderFormField)}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setDialogMode(null)}
              className="border-border bg-background text-foreground hover:bg-muted/50 rounded-2xl border px-5 py-2.5 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="border-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {dialogMode === "create" ? "Create" : "Save Changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ────────────────────────────────────────── */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="border-border bg-background text-foreground hover:bg-muted/50 rounded-2xl border px-5 py-2.5 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
              className="border-destructive/20 bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Utilities ────────────────────────────────────────────────────────────────

function FieldWrapper({
  label,
  children,
  row,
}: {
  label: string;
  children: React.ReactNode;
  row?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${row ? "flex items-center gap-3" : ""}`}>
      <Label className="text-foreground/60 text-xs tracking-wider uppercase">{label}</Label>
      {children}
    </div>
  );
}

function humanize(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

function inferFieldType(col: ColumnMeta): string {
  if (col.dataType === "boolean") return "boolean";
  if (col.dataType === "number") return "number";
  if (col.dataType === "date") return "datetime";
  if (col.dataType === "json") return "json";
  return "text";
}

function formatDate(val: unknown): string {
  if (!val) return "—";
  try {
    const d = new Date(String(val));
    return d.toLocaleDateString("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(val);
  }
}

function toDatetimeLocal(val: unknown): string {
  if (!val) return "";
  try {
    const d = new Date(String(val));
    return d.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}
