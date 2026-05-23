// src\lib\bulk-import-utils.ts
/**
 * CSV Parsing and Transformation Utilities
 * Handles CSV import, validation, and data transformation
 */

import { z } from "zod";
import { BulkImportError, BulkImportWarning, BulkImportResult } from "./bulk-import-schema";
import type { ParsedCsvRow, ValidatedBulkRow } from "@/types/bulk-import.types";

const HEADER_ALIASES: Record<string, string> = {
  action: "action",
  slug: "slug",
  name: "name",
  displayname: "displayName",
  legalname: "legalName",
  description: "description",
  isactive: "isActive",
  developerslug: "developerSlug",
  propertycategorycode: "propertyCategoryCode",
  propertytypecode: "propertyTypeCode",
  projectstatuscode: "projectStatusCode",
  tenuretypecode: "tenureTypeCode",
  titletypecode: "titleTypeCode",
  statename: "stateName",
  regionname: "regionName",
  areaname: "areaName",
  address: "address",
  latitude: "latitude",
  longitude: "longitude",
  totalunits: "totalUnits",
  launchyear: "launchYear",
  bookingfee: "bookingFee",
  maintenancefeepersqft: "maintenanceFeePerSqft",
  ispublished: "isPublished",
  isforeignereligible: "isForeignerEligible",
  tenureexpirydate: "tenureExpiryDate",
  projectslug: "projectSlug",
  layoutcode: "layoutCode",
  layoutname: "layoutName",
  bedrooms: "bedrooms",
  bathrooms: "bathrooms",
  builtupsqft: "builtUpSqft",
  studyrooms: "studyRooms",
  hasbalcony: "hasBalcony",
  hasyard: "hasYard",
  virtualtoururl: "virtualTourUrl",
  towernumber: "towerNumber",
  phasename: "phaseName",
  unitno: "unitNo",
  floor: "floor",
  stack: "stack",
  displaysequence: "displaySequence",
  landareasqft: "landAreaSqft",
  dimensiontext: "dimensionText",
  facing: "facing",
  positiontype: "positionType",
  carparkcount: "carparkCount",
  carparklotno: "carparkLotNo",
  carparktype: "carparkType",
  lottypecode: "lotTypeCode",
  bookingstatuscode: "bookingStatusCode",
  baseprice: "basePrice",
  finalprice: "finalPrice",
  phasecode: "phaseCode",
  completiondate: "completionDate",
  constructionstatuscode: "constructionStatusCode",
  floorcount: "floorCount",
  towername: "towerName",
  floormin: "floorMin",
  floormax: "floorMax",
  // Sales package
  buyertypecode: "buyerTypeCode",
  rebatepercentage: "rebatePercentage",
  cashbackamount: "cashBackAmount",
  validfrom: "validFrom",
  validto: "validTo",
  // Tower chart metadata
  key: "key",
  label: "label",
  sortorder: "sortOrder",
  stackno: "stackNo",
  facinggroupkey: "facingGroupKey",
  floorkind: "floorKind",
  floornumber: "floorNumber",
  floorlabel: "floorLabel",
  facilitylabel: "facilityLabel",
};

function normalizeHeaderKey(header: string): string {
  return header
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function toCanonicalHeader(header: string): string {
  const trimmedHeader = header.replace(/^\uFEFF/, "").trim();
  return HEADER_ALIASES[normalizeHeaderKey(trimmedHeader)] ?? trimmedHeader;
}

// ============================================
// CSV PARSING
// ============================================

/**
 * Parse CSV content into rows
 * Handles both \r\n and \n line endings
 */
export function parseCSV(csvContent: string): string[][] {
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim());

  return lines.map((line) => {
    const row: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        row.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    row.push(current.trim());
    return row;
  });
}

/**
 * Convert CSV rows to objects using header row
 */
export function csvToObjects(rows: string[][]): ParsedCsvRow[] {
  if (rows.length === 0) return [];

  const headers = rows[0].map(toCanonicalHeader);

  return rows.slice(1).map((row, rowIndex) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, colIndex) => {
      obj[header] = row[colIndex] ?? "";
    });
    return {
      ...obj,
      _rowNumber: rowIndex + 2,
    };
  });
}

// ============================================
// VALIDATION & TRANSFORMATION
// ============================================

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  error?: z.ZodError;
}

/**
 * Validate a row against a schema
 */
export function validateRow<TSchema extends z.ZodTypeAny>(
  row: ParsedCsvRow,
  schema: TSchema,
): ValidationResult<z.output<TSchema>> {
  try {
    const data = schema.parse(row);
    return { valid: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error };
    }
    throw error;
  }
}

export function validateRowsWithSchema<TSchema extends z.ZodTypeAny>(
  rows: ParsedCsvRow[],
  schema: TSchema,
  errors: BulkImportError[],
): Array<ValidatedBulkRow<z.output<TSchema>>> {
  const validatedRows: Array<ValidatedBulkRow<z.output<TSchema>>> = [];

  for (const row of rows) {
    const result = validateRow(row, schema);
    if (!result.valid && result.error) {
      errors.push(...formatValidationError(result.error, row._rowNumber));
      continue;
    }

    if (result.data) {
      validatedRows.push({ ...result.data, _rowNumber: row._rowNumber });
    }
  }

  return validatedRows;
}

/**
 * Convert Zod error to readable format
 */
export function formatValidationError(error: z.ZodError, rowNumber: number): BulkImportError[] {
  return error.issues.map((err) => ({
    rowNumber,
    field: err.path.join("."),
    message: err.message,
  }));
}

// ============================================
// BATCH PROCESSING
// ============================================

/**
 * Split array into chunks for batch processing
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Process large datasets in batches with progress callback
 */
export async function processBatches<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  batchSize: number = 100,
  onProgress?: (processed: number, total: number) => void,
): Promise<R[]> {
  const batches = chunk(items, batchSize);
  const results: R[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batchResults = await processor(batches[i]);
    results.push(...batchResults);

    const processed = Math.min((i + 1) * batchSize, items.length);
    onProgress?.(processed, items.length);
  }

  return results;
}

// ============================================
// DATA TRANSFORMATION
// ============================================

/**
 * Convert string values to appropriate types
 */
export function coerceTypes(
  row: Record<string, unknown>,
  schema: Record<string, string>,
): Record<string, unknown> {
  const result = { ...row };

  Object.entries(schema).forEach(([key, type]) => {
    if (!(key in result) || result[key] === "") return;

    const value = String(result[key]);

    switch (type) {
      case "number":
        result[key] = parseFloat(value);
        break;
      case "integer":
        result[key] = parseInt(value, 10);
        break;
      case "boolean":
        result[key] = value.toLowerCase() === "yes" || value.toLowerCase() === "true";
        break;
      case "date":
        result[key] = new Date(value);
        break;
      case "decimal":
        result[key] = parseFloat(value).toFixed(2);
        break;
    }
  });

  return result;
}

// ============================================
// DUPLICATE & CONFLICT DETECTION
// ============================================

/**
 * Find duplicate entries in a dataset
 */
export function findDuplicates(rows: ParsedCsvRow[], keyFields: string[]): Map<string, number[]> {
  const keyMap = new Map<string, number[]>();

  rows.forEach((row, index) => {
    const key = keyFields.map((field) => row[field]).join("|");
    const indices = keyMap.get(key) || [];
    indices.push(index + 2); // +2 for header row offset
    keyMap.set(key, indices);
  });

  // Return only duplicates
  const duplicates = new Map<string, number[]>();
  keyMap.forEach((indices, key) => {
    if (indices.length > 1) {
      duplicates.set(key, indices);
    }
  });

  return duplicates;
}

/**
 * Generate duplicate detection warnings
 */
export function generateDuplicateWarnings(duplicates: Map<string, number[]>): BulkImportWarning[] {
  const warnings: BulkImportWarning[] = [];

  duplicates.forEach((rowNumbers, key) => {
    warnings.push({
      rowNumber: rowNumbers[0],
      message: `Duplicate entry found in rows: ${rowNumbers.join(", ")}. Only first occurrence will be processed.`,
    });
  });

  return warnings;
}

export function keepFirstOccurrenceRows(rows: ParsedCsvRow[], keyFields: string[]): ParsedCsvRow[] {
  const seenKeys = new Set<string>();

  return rows.filter((row) => {
    const key = keyFields.map((field) => row[field]).join("|");
    if (seenKeys.has(key)) {
      return false;
    }

    seenKeys.add(key);
    return true;
  });
}

// ============================================
// RESULT FORMATTING
// ============================================

/**
 * Build summary result object
 */
export function buildImportResult(
  totalRows: number,
  successCount: number,
  errors: BulkImportError[],
  warnings: BulkImportWarning[],
  duration: number,
): BulkImportResult {
  return {
    success: errors.length === 0,
    totalRows,
    successCount,
    failureCount: totalRows - successCount,
    errors,
    warnings,
    duration,
  };
}

/**
 * Format import result for display
 */
export function formatImportResult(result: BulkImportResult): string {
  const lines = [
    `Import Summary (${result.duration}ms)`,
    `─────────────────────────`,
    `Total Rows: ${result.totalRows}`,
    `✓ Success: ${result.successCount}`,
    `✗ Failed: ${result.failureCount}`,
    `⚠ Warnings: ${result.warnings.length}`,
  ];

  if (result.errors.length > 0) {
    lines.push("\nErrors:");
    result.errors.slice(0, 10).forEach((err) => {
      lines.push(`  Row ${err.rowNumber}: ${err.field ? `[${err.field}] ` : ""}${err.message}`);
    });
    if (result.errors.length > 10) {
      lines.push(`  ... and ${result.errors.length - 10} more errors`);
    }
  }

  if (result.warnings.length > 0) {
    lines.push("\nWarnings:");
    result.warnings.slice(0, 5).forEach((warn) => {
      lines.push(`  Row ${warn.rowNumber}: ${warn.message}`);
    });
    if (result.warnings.length > 5) {
      lines.push(`  ... and ${result.warnings.length - 5} more warnings`);
    }
  }

  return lines.join("\n");
}
