---
description: "Use when editing database schema, creating tables, adding columns, or writing Drizzle ORM queries. Covers schema patterns, relations, and lookup table conventions."
applyTo: "src/db/**"
---

# Drizzle Schema Conventions

- All tables defined in single file: `src/db/schema.ts`
- Use `pgTable()` with snake_case table names, camelCase column names in code
- Lookup tables (categories, statuses, types) use a `code` varchar field as a stable identifier for bulk import FK resolution — never use raw numeric IDs for cross-system references
- Define Drizzle `relations()` alongside each table for relational query support
- `src/db/index.ts` exports a singleton typed Drizzle instance — never add `| any` to its type (breaks query inference downstream)
- Use Drizzle relational query API (`db.query.tableName.findMany()`) for reads
- Use standard `db.insert()`, `db.update()`, `db.delete()` for writes
- Timestamps: use `timestamp("created_at").defaultNow()` pattern
- Foreign keys: use `.references(() => parentTable.id)` syntax
- After schema changes: run `npx drizzle-kit push` or `npx drizzle-kit generate`
