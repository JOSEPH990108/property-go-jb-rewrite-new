// src/app/actions/admin-crud-actions.ts
'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { and, asc, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm';
import { getTableColumns } from 'drizzle-orm';
import { db } from '@/db';
import { user, roles } from '@/db/schema';
import { requireAdmin } from '@/lib/server-auth';
import { TABLE_REGISTRY, type TableConfig } from '@/lib/admin-table-registry';
import type { ActionResult } from '@/types/action-result.types';

// ── Types ────────────────────────────────────────────────────────────────────

type CrudResult<T = undefined> = ActionResult<T>;

export type TableListResult = {
  records: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ColumnMeta = {
  name: string;
  dataType: string;
  notNull: boolean;
  hasDefault: boolean;
  isPrimaryKey: boolean;
};

export type TableMetaResult = {
  columns: ColumnMeta[];
  foreignKeyOptions: Record<string, { value: string; label: string }[]>;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getConfig(tableName: string): TableConfig | null {
  return TABLE_REGISTRY[tableName] ?? null;
}

function getPKColumn(config: TableConfig) {
  const cols = getTableColumns(config.table);
  const pkName = config.primaryKey ?? 'id';
  return { name: pkName, column: cols[pkName] };
}

// ── Get table metadata (columns + FK options) ────────────────────────────────

export async function getTableMeta(tableName: string): Promise<CrudResult<TableMetaResult>> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return { success: false, error: admin.error };

    const config = getConfig(tableName);
    if (!config) return { success: false, error: `Unknown table: ${tableName}` };

    const cols = getTableColumns(config.table);
    const columns: ColumnMeta[] = Object.entries(cols).map(([name, col]) => ({
      name,
      dataType: (col as any).dataType ?? 'string',
      notNull: (col as any).notNull ?? false,
      hasDefault: (col as any).hasDefault ?? false,
      isPrimaryKey: (col as any).primary ?? false,
    }));

    // Resolve FK options
    const overrides = config.columnOverrides ?? {};
    const foreignKeyOptions: Record<string, { value: string; label: string }[]> = {};

    const fkEntries = Object.entries(overrides).filter(([, ov]) => ov.foreignKey);

    await Promise.all(
      fkEntries.map(async ([colName, ov]) => {
        const fk = ov.foreignKey!;
        const refConfig = getConfig(fk.table);
        if (!refConfig) return;

        const refCols = getTableColumns(refConfig.table);
        const valCol = fk.valueColumn ?? refConfig.primaryKey ?? 'id';
        const lblCol = fk.labelColumn;

        if (!refCols[valCol] || !refCols[lblCol]) return;

        const rows = await db
          .select({
            value: refCols[valCol],
            label: refCols[lblCol],
          })
          .from(refConfig.table)
          .orderBy(asc(refCols[lblCol]))
          .limit(500);

        foreignKeyOptions[colName] = rows.map((r) => ({
          value: String(r.value),
          label: String(r.label),
        }));
      }),
    );

    return { success: true, data: { columns, foreignKeyOptions } };
  } catch (error) {
    console.error(`getTableMeta(${tableName}) failed:`, error);
    return { success: false, error: 'Failed to load table metadata' };
  }
}

// ── List records ─────────────────────────────────────────────────────────────

export async function listTableRecords(
  tableName: string,
  page = 1,
  limit = 50,
  search?: string,
): Promise<CrudResult<TableListResult>> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return { success: false, error: admin.error };

    const config = getConfig(tableName);
    if (!config) return { success: false, error: `Unknown table: ${tableName}` };

    const cols = getTableColumns(config.table);
    const offset = (page - 1) * limit;

    // Build search filter
    let whereClause: SQL | undefined;
    if (search && search.trim()) {
      const searchCols = config.searchColumns ?? [];
      const conditions = searchCols
        .filter((c) => cols[c])
        .map((c) => ilike(cols[c], `%${search.trim()}%`));

      if (conditions.length > 0) {
        whereClause = or(...conditions);
      }
    }

    // Build order by
    let orderClause;
    if (config.defaultSort && cols[config.defaultSort.column]) {
      const sortCol = cols[config.defaultSort.column];
      orderClause = config.defaultSort.direction === 'desc' ? desc(sortCol) : asc(sortCol);
    }

    // Count total
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(config.table)
      .where(whereClause);
    const total = Number(countResult[0]?.count ?? 0);

    // Fetch records
    const baseQuery = db.select().from(config.table).where(whereClause);
    const orderedQuery = orderClause ? baseQuery.orderBy(orderClause) : baseQuery;
    const records = await orderedQuery.limit(limit).offset(offset);

    return {
      success: true,
      data: {
        records: records as Record<string, unknown>[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error(`listTableRecords(${tableName}) failed:`, error);
    return { success: false, error: 'Failed to list records' };
  }
}

// ── Create record ────────────────────────────────────────────────────────────

export async function createTableRecord(
  tableName: string,
  data: Record<string, unknown>,
): Promise<CrudResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return { success: false, error: admin.error };

    const config = getConfig(tableName);
    if (!config) return { success: false, error: `Unknown table: ${tableName}` };

    const cols = getTableColumns(config.table);
    const values: Record<string, unknown> = {};

    // If the table has an 'id' column with default, generate it
    if (cols.id && !config.compositePK) {
      values.id = randomUUID();
    }

    // Map each provided field
    for (const [key, val] of Object.entries(data)) {
      if (!cols[key]) continue;
      const override = config.columnOverrides?.[key];
      if (override?.readOnly || override?.formHidden) continue;

      values[key] = coerceValue(val, override?.fieldType);
    }

    // Set timestamps if columns exist
    if (cols.createdAt) values.createdAt = new Date();
    if (cols.updatedAt) values.updatedAt = new Date();

    await db.insert(config.table).values(values);

    revalidatePath('/admin');
    return { success: true, data: undefined };
  } catch (error) {
    console.error(`createTableRecord(${tableName}) failed:`, error);
    const msg = error instanceof Error ? error.message : 'Failed to create record';
    return { success: false, error: msg };
  }
}

// ── Update record ────────────────────────────────────────────────────────────

export async function updateTableRecord(
  tableName: string,
  id: string,
  data: Record<string, unknown>,
): Promise<CrudResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return { success: false, error: admin.error };

    const config = getConfig(tableName);
    if (!config) return { success: false, error: `Unknown table: ${tableName}` };

    if (config.compositePK) {
      return { success: false, error: 'Use updateJunctionRecord for composite-PK tables' };
    }

    const cols = getTableColumns(config.table);
    const pk = getPKColumn(config);

    const values: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data)) {
      if (!cols[key]) continue;
      const override = config.columnOverrides?.[key];
      if (override?.readOnly || override?.formHidden) continue;
      if (key === pk.name) continue; // don't update PK

      values[key] = coerceValue(val, override?.fieldType);
    }

    if (cols.updatedAt) values.updatedAt = new Date();

    await db
      .update(config.table)
      .set(values)
      .where(eq(pk.column, id));

    revalidatePath('/admin');
    return { success: true, data: undefined };
  } catch (error) {
    console.error(`updateTableRecord(${tableName}) failed:`, error);
    const msg = error instanceof Error ? error.message : 'Failed to update record';
    return { success: false, error: msg };
  }
}

// ── Delete record ────────────────────────────────────────────────────────────

export async function deleteTableRecord(
  tableName: string,
  id: string,
): Promise<CrudResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return { success: false, error: admin.error };

    const config = getConfig(tableName);
    if (!config) return { success: false, error: `Unknown table: ${tableName}` };

    if (config.compositePK) {
      return { success: false, error: 'Use deleteJunctionRecord for composite-PK tables' };
    }

    const pk = getPKColumn(config);
    await db.delete(config.table).where(eq(pk.column, id));

    revalidatePath('/admin');
    return { success: true, data: undefined };
  } catch (error) {
    console.error(`deleteTableRecord(${tableName}) failed:`, error);
    return {
      success: false,
      error: 'Unable to delete. This record may be referenced by other records.',
    };
  }
}

// ── Junction table CRUD ──────────────────────────────────────────────────────

export async function createJunctionRecord(
  tableName: string,
  data: Record<string, unknown>,
): Promise<CrudResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return { success: false, error: admin.error };

    const config = getConfig(tableName);
    if (!config) return { success: false, error: `Unknown table: ${tableName}` };
    if (!config.compositePK) return { success: false, error: 'Not a junction table' };

    const cols = getTableColumns(config.table);
    const values: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(data)) {
      if (!cols[key]) continue;
      values[key] = coerceValue(val, config.columnOverrides?.[key]?.fieldType);
    }

    await db.insert(config.table).values(values);

    revalidatePath('/admin');
    return { success: true, data: undefined };
  } catch (error) {
    console.error(`createJunctionRecord(${tableName}) failed:`, error);
    const msg = error instanceof Error ? error.message : 'Failed to create record';
    return { success: false, error: msg };
  }
}

export async function deleteJunctionRecord(
  tableName: string,
  keys: Record<string, string>,
): Promise<CrudResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return { success: false, error: admin.error };

    const config = getConfig(tableName);
    if (!config) return { success: false, error: `Unknown table: ${tableName}` };
    if (!config.compositePK) return { success: false, error: 'Not a junction table' };

    const cols = getTableColumns(config.table);
    const conditions = config.compositePK
      .filter((k) => cols[k] && keys[k])
      .map((k) => eq(cols[k], keys[k]));

    if (conditions.length !== config.compositePK.length) {
      return { success: false, error: 'All composite key fields are required' };
    }

    await db.delete(config.table).where(and(...conditions));

    revalidatePath('/admin');
    return { success: true, data: undefined };
  } catch (error) {
    console.error(`deleteJunctionRecord(${tableName}) failed:`, error);
    return { success: false, error: 'Failed to delete record' };
  }
}

// ── Value coercion ───────────────────────────────────────────────────────────

function coerceValue(val: unknown, fieldType?: string): unknown {
  if (val === '' || val === undefined) return null;
  if (val === null) return null;

  switch (fieldType) {
    case 'number':
      return val === null ? null : Number(val);
    case 'decimal':
      return val === null ? null : String(val);
    case 'boolean':
      if (typeof val === 'string') return val === 'true';
      return Boolean(val);
    case 'date':
      if (!val) return null;
      return String(val);
    case 'datetime':
      if (!val) return null;
      return new Date(String(val));
    case 'json':
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return val; }
      }
      return val;
    default:
      return val;
  }
}
