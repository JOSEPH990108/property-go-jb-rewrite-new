---
description: "Use when working on bulk import CSV parsing, entity config, import schemas, or the import dialog. Covers CSV handling, header normalization, FK resolution, and the import pipeline."
applyTo:
  [
    "src/lib/bulk-import-*",
    "src/app/actions/bulk-import-*",
    "src/components/admin/BulkImportDialog*",
    "src/hooks/useBulkImportDialog*",
    "samples/**",
  ]
---

# Bulk Import System

## Pipeline

CSV Upload → Parse RFC 4180 → Header Canonicalization → Duplicate Detection → Zod Validation → FK Resolution by `code` → Batch Insert/Update → Results

## Key Files

- `src/lib/bulk-import-utils.ts` — `parseCSV()` (RFC 4180, BOM-safe), `csvToObjects()`, `findDuplicates()`, `chunk()`
- `src/lib/bulk-import-schema.ts` — Zod schemas per entity
- `src/lib/bulk-import-config.ts` — Entity config registry (`BULK_IMPORT_ENTITY_CONFIG`)
- `src/app/actions/bulk-import-actions.ts` — Server actions for each entity type
- `src/components/admin/BulkImportDialog.tsx` — UI for uploading and progress
- `src/hooks/useBulkImportDialog.ts` — Dialog state management

## Rules

- Headers are canonicalized: support camelCase, lowercase, and BOM-prefixed variations
- File input accepts `.csv` + MIME types: `text/csv`, `application/csv`, `application/vnd.ms-excel`, `text/plain`, empty
- Foreign keys are resolved via lookup table `code` fields — never by raw IDs
- Template downloads must include a full sample row matching all headers
- Show global loader during imports: "Compiling Import..." before parse, "Importing Records..." before server action
- Entity dropdown uses `undefined` for unselected state (not empty string)
