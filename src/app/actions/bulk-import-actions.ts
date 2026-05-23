// src\app\actions\bulk-import-actions.ts
"use server";

import { db } from "@/db";
import {
  projects,
  projectLayouts,
  units,
  projectPhases,
  projectTowers,
  developers,
  propertyCategories,
  propertyTypes,
  projectStatuses,
  tenureTypes,
  titleTypes,
  states,
  regions,
  areas,
  unitPositions,
  lotTypes,
  bookingStatuses,
  constructionStatuses,
  salesPackages,
  buyerTypes,
  towerFacingGroups,
  towerStacks,
  towerSpecialFloors,
} from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  BulkDeveloperSchema,
  BulkProjectSchema,
  BulkProjectLayoutSchema,
  BulkUnitSchema,
  BulkPhaseSchema,
  BulkTowerSchema,
  BulkSalesPackageSchema,
  BulkTowerFacingGroupSchema,
  BulkTowerStackSchema,
  BulkTowerSpecialFloorSchema,
  BulkImportResult,
  BulkImportError,
  BulkImportWarning,
} from "@/lib/bulk-import-schema";
import {
  parseCSV,
  csvToObjects,
  validateRowsWithSchema,
  findDuplicates,
  generateDuplicateWarnings,
  keepFirstOccurrenceRows,
  buildImportResult,
} from "@/lib/bulk-import-utils";
import type { ValidatedBulkRow } from "@/types/bulk-import.types";

type CodeLookupTable =
  | typeof propertyCategories
  | typeof propertyTypes
  | typeof projectStatuses
  | typeof tenureTypes
  | typeof titleTypes
  | typeof lotTypes
  | typeof bookingStatuses
  | typeof constructionStatuses
  | typeof buyerTypes;

type NameLookupTable = typeof unitPositions;

type ValidatedDeveloperRow = ValidatedBulkRow<z.infer<typeof BulkDeveloperSchema>>;
type ValidatedProjectRow = ValidatedBulkRow<z.infer<typeof BulkProjectSchema>>;
type ValidatedLayoutRow = ValidatedBulkRow<z.infer<typeof BulkProjectLayoutSchema>>;
type ValidatedUnitRow = ValidatedBulkRow<z.infer<typeof BulkUnitSchema>>;
type ValidatedPhaseRow = ValidatedBulkRow<z.infer<typeof BulkPhaseSchema>>;
type ValidatedTowerRow = ValidatedBulkRow<z.infer<typeof BulkTowerSchema>>;
type ValidatedSalesPackageRow = ValidatedBulkRow<z.infer<typeof BulkSalesPackageSchema>>;
type ValidatedTowerFacingGroupRow = ValidatedBulkRow<z.infer<typeof BulkTowerFacingGroupSchema>>;
type ValidatedTowerStackRow = ValidatedBulkRow<z.infer<typeof BulkTowerStackSchema>>;
type ValidatedTowerSpecialFloorRow = ValidatedBulkRow<z.infer<typeof BulkTowerSpecialFloorSchema>>;

// ============================================
// HELPER: Resolve Foreign Keys
// ============================================

async function resolveLookupId(table: CodeLookupTable, codeValue: string): Promise<string | null> {
  if (!codeValue) return null;

  const record = await db
    .select({ id: table.id })
    .from(table)
    .where(eq(table.code, codeValue))
    .limit(1);

  return record[0]?.id || null;
}

async function resolveLookupIdByName(
  table: NameLookupTable,
  nameValue: string,
): Promise<string | null> {
  if (!nameValue) return null;

  const record = await db
    .select({ id: table.id })
    .from(table)
    .where(eq(table.name, nameValue))
    .limit(1);

  return record[0]?.id || null;
}

async function resolveStateId(stateName: string): Promise<string | null> {
  if (!stateName) return null;

  const state = await db
    .select({ id: states.id })
    .from(states)
    .where(eq(states.name, stateName))
    .limit(1);

  return state[0]?.id || null;
}

async function resolveRegionId(regionName: string, stateId?: string): Promise<string | null> {
  if (!regionName) return null;

  const conditions = [eq(regions.name, regionName)];
  if (stateId) {
    conditions.push(eq(regions.stateId, stateId));
  }

  const region = await db
    .select({ id: regions.id })
    .from(regions)
    .where(and(...conditions))
    .limit(1);
  return region[0]?.id || null;
}

async function resolveAreaId(areaName: string, regionId?: string): Promise<string | null> {
  if (!areaName) return null;

  const conditions = [eq(areas.name, areaName)];
  if (regionId) {
    conditions.push(eq(areas.regionId, regionId));
  }

  const area = await db
    .select({ id: areas.id })
    .from(areas)
    .where(and(...conditions))
    .limit(1);
  return area[0]?.id || null;
}

async function resolveProjectId(slug: string): Promise<string | null> {
  if (!slug) return null;

  const project = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);

  return project[0]?.id || null;
}

async function resolveDeveloperId(slug: string): Promise<string | null> {
  if (!slug) return null;

  const developer = await db
    .select({ id: developers.id })
    .from(developers)
    .where(eq(developers.slug, slug))
    .limit(1);

  return developer[0]?.id || null;
}

// ============================================
// HELPER: Batch Lookup Cache (eliminates N+1)
// ============================================

/**
 * Resolves a code → id map for an entire import run in a single query.
 * Pass all unique codes extracted from the CSV; the map will contain
 * only codes that actually exist in the DB (unknown codes are absent).
 */
async function buildCodeLookupMap(
  table: CodeLookupTable,
  codes: string[],
): Promise<Map<string, string>> {
  const uniqueCodes = [...new Set(codes.filter(Boolean))];
  if (uniqueCodes.length === 0) return new Map();

  const records = await db
    .select({ id: table.id, code: table.code })
    .from(table)
    .where(inArray(table.code, uniqueCodes));

  return new Map(records.map((r) => [r.code, r.id]));
}

function addAlreadyExistsWarning(
  warnings: BulkImportWarning[],
  rowNumber: number,
  entityLabel: string,
  identifier: string,
  identifierValue: string,
) {
  warnings.push({
    rowNumber,
    message: `${entityLabel} with ${identifier} "${identifierValue}" already exists. Row skipped.`,
  });
}

// ============================================
// BULK DEVELOPER IMPORT
// ============================================

export async function bulkImportDevelopers(csvContent: string): Promise<BulkImportResult> {
  const startTime = Date.now();
  const errors: BulkImportError[] = [];
  const warnings: BulkImportWarning[] = [];
  let successCount = 0;

  try {
    const rows = parseCSV(csvContent);
    const objects = csvToObjects(rows);

    if (objects.length === 0) {
      return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
    }

    const duplicates = findDuplicates(objects, ["slug"]);
    warnings.push(...generateDuplicateWarnings(duplicates));
    const processedRows = keepFirstOccurrenceRows(objects, ["slug"]);

    const validatedRows: ValidatedDeveloperRow[] = validateRowsWithSchema(
      processedRows,
      BulkDeveloperSchema,
      errors,
    );

    for (const data of validatedRows) {
      try {
        const existingDeveloper = await db
          .select({ id: developers.id })
          .from(developers)
          .where(eq(developers.slug, data.slug))
          .limit(1);

        const insertData = {
          slug: data.slug,
          name: data.name,
          legalName: data.legalName || null,
          description: data.description || null,
          isActive: data.isActive,
        };

        if (data.action === "update") {
          if (!existingDeveloper[0]) {
            errors.push({
              rowNumber: data._rowNumber,
              field: "slug",
              message: `Developer with slug "${data.slug}" not found for update`,
            });
            continue;
          }

          await db
            .update(developers)
            .set({ ...insertData, updatedAt: new Date() })
            .where(eq(developers.slug, data.slug));
        } else {
          if (existingDeveloper[0]) {
            addAlreadyExistsWarning(warnings, data._rowNumber, "Developer", "slug", data.slug);
            successCount++;
            continue;
          }

          await db.insert(developers).values(insertData);
        }

        successCount++;
      } catch (err) {
        errors.push({
          rowNumber: data._rowNumber,
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return buildImportResult(
      objects.length,
      successCount,
      errors,
      warnings,
      Date.now() - startTime,
    );
  } catch (error) {
    errors.push({
      rowNumber: 0,
      message: error instanceof Error ? error.message : "CSV parsing failed",
    });
    return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
  }
}

// ============================================
// BULK PROJECT IMPORT
// ============================================

export async function bulkImportProjects(csvContent: string): Promise<BulkImportResult> {
  const startTime = Date.now();
  const errors: BulkImportError[] = [];
  const warnings: BulkImportWarning[] = [];
  let successCount = 0;

  try {
    // Parse CSV
    const rows = parseCSV(csvContent);
    const objects = csvToObjects(rows);

    if (objects.length === 0) {
      return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
    }

    // Check for duplicates
    const duplicates = findDuplicates(objects, ["slug"]);
    warnings.push(...generateDuplicateWarnings(duplicates));
    const processedRows = keepFirstOccurrenceRows(objects, ["slug"]);

    // Validate each row
    const validatedRows: ValidatedProjectRow[] = validateRowsWithSchema(
      processedRows,
      BulkProjectSchema,
      errors,
    );

    // Batch insert/update
    const batchSize = 10;
    for (let i = 0; i < validatedRows.length; i += batchSize) {
      const batch = validatedRows.slice(i, i + batchSize);

      for (const data of batch) {
        try {
          const existingProject = await db
            .select({ id: projects.id })
            .from(projects)
            .where(eq(projects.slug, data.slug))
            .limit(1);

          // Resolve foreign keys
          const developerId = await resolveDeveloperId(data.developerSlug);
          if (!developerId) {
            errors.push({
              rowNumber: data._rowNumber,
              field: "developerSlug",
              message: `Developer with slug "${data.developerSlug}" not found`,
            });
            continue;
          }

          const categoryCategoryId = data.propertyCategoryCode
            ? await resolveLookupId(propertyCategories, data.propertyCategoryCode)
            : null;

          const propertyTypeId = data.propertyTypeCode
            ? await resolveLookupId(propertyTypes, data.propertyTypeCode)
            : null;

          const statusId = data.projectStatusCode
            ? await resolveLookupId(projectStatuses, data.projectStatusCode)
            : null;

          const tenureTypeId = await resolveLookupId(tenureTypes, data.tenureTypeCode);
          if (!tenureTypeId) {
            errors.push({
              rowNumber: data._rowNumber,
              field: "tenureTypeCode",
              message: `Tenure type with code "${data.tenureTypeCode}" not found`,
            });
            continue;
          }

          const titleTypeId = data.titleTypeCode
            ? await resolveLookupId(titleTypes, data.titleTypeCode)
            : null;

          const stateId = data.stateName ? await resolveStateId(data.stateName) : null;
          const regionId = data.regionName
            ? await resolveRegionId(data.regionName, stateId ?? undefined)
            : null;
          const areaId = data.areaName
            ? await resolveAreaId(data.areaName, regionId ?? undefined)
            : null;

          // Prepare insert/update data
          const insertData = {
            slug: data.slug,
            name: data.name,
            displayName: data.displayName || null,
            legalName: data.legalName || null,
            description: data.description || null,
            developerId,
            propertyCategoryId: categoryCategoryId,
            propertyTypeId,
            projectStatusId: statusId,
            tenureTypeId,
            titleTypeId,
            tenureExpiryDate: data.tenureExpiryDate || null,
            regionId,
            areaId,
            address: data.address || null,
            latitude: data.latitude ? String(data.latitude) : null,
            longitude: data.longitude ? String(data.longitude) : null,
            totalUnits: data.totalUnits ? parseInt(data.totalUnits) : 0,
            launchYear: data.launchYear ? parseInt(data.launchYear) : null,
            bookingFee: data.bookingFee ? String(data.bookingFee) : "1000.00",
            maintenanceFeePerSqft: data.maintenanceFeePerSqft
              ? String(data.maintenanceFeePerSqft)
              : null,
            isPublished: data.isPublished || false,
            isForeignerEligible: data.isForeignerEligible !== false,
            isActive: true,
          };

          if (data.action === "update") {
            if (!existingProject[0]) {
              errors.push({
                rowNumber: data._rowNumber,
                field: "slug",
                message: `Project with slug "${data.slug}" not found for update`,
              });
              continue;
            }

            await db
              .update(projects)
              .set({ ...insertData, updatedAt: new Date() })
              .where(eq(projects.slug, data.slug));
          } else {
            if (existingProject[0]) {
              addAlreadyExistsWarning(warnings, data._rowNumber, "Project", "slug", data.slug);
              successCount++;
              continue;
            }

            await db.insert(projects).values(insertData);
          }

          successCount++;
        } catch (err) {
          errors.push({
            rowNumber: data._rowNumber,
            message: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }
    }

    return buildImportResult(
      objects.length,
      successCount,
      errors,
      warnings,
      Date.now() - startTime,
    );
  } catch (error) {
    errors.push({
      rowNumber: 0,
      message: error instanceof Error ? error.message : "CSV parsing failed",
    });
    return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
  }
}

// ============================================
// BULK LAYOUT IMPORT
// ============================================

export async function bulkImportLayouts(csvContent: string): Promise<BulkImportResult> {
  const startTime = Date.now();
  const errors: BulkImportError[] = [];
  const warnings: BulkImportWarning[] = [];
  let successCount = 0;

  try {
    const rows = parseCSV(csvContent);
    const objects = csvToObjects(rows);

    if (objects.length === 0) {
      return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
    }

    const validatedRows: ValidatedLayoutRow[] = validateRowsWithSchema(
      objects,
      BulkProjectLayoutSchema,
      errors,
    );

    for (const data of validatedRows) {
      try {
        const projectId = await resolveProjectId(data.projectSlug);
        if (!projectId) {
          errors.push({
            rowNumber: data._rowNumber,
            field: "projectSlug",
            message: `Project with slug "${data.projectSlug}" not found`,
          });
          continue;
        }

        const insertData = {
          projectId,
          code: data.layoutCode,
          name: data.layoutName,
          builtUpSqft: String(data.builtUpSqft),
          bedrooms: parseInt(data.bedrooms),
          bathrooms: parseInt(data.bathrooms),
          studyRooms: parseInt(data.studyRooms) || 0,
          hasBalcony: data.hasBalcony || false,
          hasYard: data.hasYard || false,
          virtualTourUrl: data.virtualTourUrl || null,
        };

        if (data.action === "update") {
          const existing = await db
            .select({ id: projectLayouts.id })
            .from(projectLayouts)
            .where(
              and(
                eq(projectLayouts.projectId, projectId),
                eq(projectLayouts.code, data.layoutCode),
              ),
            )
            .limit(1);

          if (existing[0]) {
            await db
              .update(projectLayouts)
              .set({ ...insertData, updatedAt: new Date() })
              .where(eq(projectLayouts.id, existing[0].id));
          } else {
            await db.insert(projectLayouts).values(insertData);
          }
        } else {
          const existing = await db
            .select({ id: projectLayouts.id })
            .from(projectLayouts)
            .where(
              and(
                eq(projectLayouts.projectId, projectId),
                eq(projectLayouts.code, data.layoutCode),
              ),
            )
            .limit(1);

          if (existing[0]) {
            addAlreadyExistsWarning(warnings, data._rowNumber, "Layout", "code", data.layoutCode);
            successCount++;
            continue;
          }

          await db.insert(projectLayouts).values(insertData);
        }

        successCount++;
      } catch (err) {
        errors.push({
          rowNumber: data._rowNumber,
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return buildImportResult(
      objects.length,
      successCount,
      errors,
      warnings,
      Date.now() - startTime,
    );
  } catch (error) {
    errors.push({
      rowNumber: 0,
      message: error instanceof Error ? error.message : "CSV parsing failed",
    });
    return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
  }
}

// ============================================
// BULK UNIT IMPORT
// ============================================

export async function bulkImportUnits(csvContent: string): Promise<BulkImportResult> {
  const startTime = Date.now();
  const errors: BulkImportError[] = [];
  const warnings: BulkImportWarning[] = [];
  let successCount = 0;

  try {
    const rows = parseCSV(csvContent);
    const objects = csvToObjects(rows);

    if (objects.length === 0) {
      return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
    }

    const validatedRows: ValidatedUnitRow[] = validateRowsWithSchema(
      objects,
      BulkUnitSchema,
      errors,
    );
    if (validatedRows.length === 0) {
      return buildImportResult(objects.length, 0, errors, warnings, Date.now() - startTime);
    }

    // ── Batch pre-resolve all lookup codes in 2 queries instead of N*2 ──
    const lotTypeMap = await buildCodeLookupMap(
      lotTypes,
      validatedRows.map((r) => r.lotTypeCode),
    );
    const bookingStatusMap = await buildCodeLookupMap(
      bookingStatuses,
      validatedRows.map((r) => r.bookingStatusCode),
    );

    // ── Per-run caches for project-scoped lookups (slug/name → id) ──
    // Key pattern: "<projectId>:<code|name>" — avoids redundant queries
    // when many rows share the same project + tower/layout/phase.
    const projectCache = new Map<string, string | null>(); // slug → projectId
    const layoutCache = new Map<string, string | null>(); // `${projectId}:${layoutCode}`
    const towerCache = new Map<string, string | null>(); // `${projectId}:${towerNumber}`
    const phaseCache = new Map<string, string | null>(); // `${projectId}:${phaseName}`
    const positionCache = new Map<string, string | null>(); // name → id

    const getProjectId = async (slug: string): Promise<string | null> => {
      if (!projectCache.has(slug)) projectCache.set(slug, await resolveProjectId(slug));
      return projectCache.get(slug)!;
    };

    const getLayoutId = async (projectId: string, code: string): Promise<string | null> => {
      const key = `${projectId}:${code}`;
      if (!layoutCache.has(key)) {
        const rec = await db
          .select({ id: projectLayouts.id })
          .from(projectLayouts)
          .where(and(eq(projectLayouts.projectId, projectId), eq(projectLayouts.code, code)))
          .limit(1);
        layoutCache.set(key, rec[0]?.id ?? null);
      }
      return layoutCache.get(key)!;
    };

    const getTowerId = async (projectId: string, towerNumber: string): Promise<string | null> => {
      const key = `${projectId}:${towerNumber}`;
      if (!towerCache.has(key)) {
        const rec = await db
          .select({ id: projectTowers.id })
          .from(projectTowers)
          .where(
            and(eq(projectTowers.projectId, projectId), eq(projectTowers.towerNumber, towerNumber)),
          )
          .limit(1);
        towerCache.set(key, rec[0]?.id ?? null);
      }
      return towerCache.get(key)!;
    };

    const getPhaseId = async (projectId: string, phaseName: string): Promise<string | null> => {
      const key = `${projectId}:${phaseName}`;
      if (!phaseCache.has(key)) {
        const rec = await db
          .select({ id: projectPhases.id })
          .from(projectPhases)
          .where(and(eq(projectPhases.projectId, projectId), eq(projectPhases.name, phaseName)))
          .limit(1);
        phaseCache.set(key, rec[0]?.id ?? null);
      }
      return phaseCache.get(key)!;
    };

    const getPositionTypeId = async (name: string): Promise<string | null> => {
      if (!positionCache.has(name))
        positionCache.set(name, await resolveLookupIdByName(unitPositions, name));
      return positionCache.get(name)!;
    };

    for (const data of validatedRows) {
      try {
        const projectId = await getProjectId(data.projectSlug);
        if (!projectId) {
          errors.push({
            rowNumber: data._rowNumber,
            field: "projectSlug",
            message: `Project with slug "${data.projectSlug}" not found`,
          });
          continue;
        }

        const lotTypeId = lotTypeMap.get(data.lotTypeCode) ?? null;
        if (!lotTypeId) {
          errors.push({
            rowNumber: data._rowNumber,
            field: "lotTypeCode",
            message: `Lot type with code "${data.lotTypeCode}" not found`,
          });
          continue;
        }

        const bookingStatusId = bookingStatusMap.get(data.bookingStatusCode) ?? null;
        if (!bookingStatusId) {
          errors.push({
            rowNumber: data._rowNumber,
            field: "bookingStatusCode",
            message: `Booking status with code "${data.bookingStatusCode}" not found`,
          });
          continue;
        }

        const [layoutId, towerId, phaseId, positionTypeId] = await Promise.all([
          data.layoutCode ? getLayoutId(projectId, data.layoutCode) : null,
          data.towerNumber ? getTowerId(projectId, data.towerNumber) : null,
          data.phaseName ? getPhaseId(projectId, data.phaseName) : null,
          data.positionType ? getPositionTypeId(data.positionType) : null,
        ]);

        const insertData = {
          projectId,
          layoutId: layoutId ?? null,
          towerId: towerId ?? null,
          phaseId: phaseId ?? null,
          unitNo: data.unitNo,
          floor: data.floor ? parseInt(data.floor) : null,
          stack: data.stack || null,
          displaySequence: data.displaySequence ? parseInt(data.displaySequence) : 0,
          builtUpSqft: data.builtUpSqft ? String(data.builtUpSqft) : null,
          landAreaSqft: data.landAreaSqft ? String(data.landAreaSqft) : null,
          dimensionText: data.dimensionText || null,
          facing: data.facing || null,
          positionTypeId: positionTypeId ?? null,
          carparkCount: parseInt(data.carparkCount) || 1,
          carparkLotNo: data.carparkLotNo || null,
          carparkType: data.carparkType || null,
          lotTypeId,
          bookingStatusId,
          basePrice: String(data.basePrice),
          finalPrice: data.finalPrice ? String(data.finalPrice) : null,
        };

        if (data.action === "update") {
          const existing = await db
            .select({ id: units.id })
            .from(units)
            .where(and(eq(units.projectId, projectId), eq(units.unitNo, data.unitNo)))
            .limit(1);

          if (existing[0]) {
            await db
              .update(units)
              .set({ ...insertData, updatedAt: new Date() })
              .where(eq(units.id, existing[0].id));
          } else {
            await db.insert(units).values(insertData);
          }
        } else {
          const existing = await db
            .select({ id: units.id })
            .from(units)
            .where(and(eq(units.projectId, projectId), eq(units.unitNo, data.unitNo)))
            .limit(1);

          if (existing[0]) {
            addAlreadyExistsWarning(warnings, data._rowNumber, "Unit", "unit number", data.unitNo);
            successCount++;
            continue;
          }

          await db.insert(units).values(insertData);
        }

        successCount++;
      } catch (err) {
        errors.push({
          rowNumber: data._rowNumber,
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return buildImportResult(
      objects.length,
      successCount,
      errors,
      warnings,
      Date.now() - startTime,
    );
  } catch (error) {
    errors.push({
      rowNumber: 0,
      message: error instanceof Error ? error.message : "CSV parsing failed",
    });
    return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
  }
}

// ============================================
// BULK PHASE IMPORT
// ============================================

export async function bulkImportPhases(csvContent: string): Promise<BulkImportResult> {
  const startTime = Date.now();
  const errors: BulkImportError[] = [];
  const warnings: BulkImportWarning[] = [];
  let successCount = 0;

  try {
    const rows = parseCSV(csvContent);
    const objects = csvToObjects(rows);

    if (objects.length === 0) {
      return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
    }

    const validatedRows: ValidatedPhaseRow[] = validateRowsWithSchema(
      objects,
      BulkPhaseSchema,
      errors,
    );

    for (const data of validatedRows) {
      try {
        const projectId = await resolveProjectId(data.projectSlug);
        if (!projectId) {
          errors.push({
            rowNumber: data._rowNumber,
            field: "projectSlug",
            message: `Project with slug "${data.projectSlug}" not found`,
          });
          continue;
        }

        const constructionStatusId = data.constructionStatusCode
          ? await resolveLookupId(constructionStatuses, data.constructionStatusCode)
          : null;

        const insertData = {
          projectId,
          name: data.phaseName,
          phaseCode: data.phaseCode,
          completionDate: data.completionDate || null,
          constructionStatusId,
        };

        if (data.action === "update") {
          const existing = await db
            .select({ id: projectPhases.id })
            .from(projectPhases)
            .where(
              and(
                eq(projectPhases.projectId, projectId),
                eq(projectPhases.phaseCode, data.phaseCode),
              ),
            )
            .limit(1);

          if (existing[0]) {
            await db
              .update(projectPhases)
              .set({ ...insertData, updatedAt: new Date() })
              .where(eq(projectPhases.id, existing[0].id));
          } else {
            await db.insert(projectPhases).values(insertData);
          }
        } else {
          const existing = await db
            .select({ id: projectPhases.id })
            .from(projectPhases)
            .where(
              and(
                eq(projectPhases.projectId, projectId),
                eq(projectPhases.phaseCode, data.phaseCode),
              ),
            )
            .limit(1);

          if (existing[0]) {
            addAlreadyExistsWarning(warnings, data._rowNumber, "Phase", "code", data.phaseCode);
            successCount++;
            continue;
          }

          await db.insert(projectPhases).values(insertData);
        }

        successCount++;
      } catch (err) {
        errors.push({
          rowNumber: data._rowNumber,
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return buildImportResult(
      objects.length,
      successCount,
      errors,
      warnings,
      Date.now() - startTime,
    );
  } catch (error) {
    errors.push({
      rowNumber: 0,
      message: error instanceof Error ? error.message : "CSV parsing failed",
    });
    return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
  }
}

// ============================================
// BULK TOWER IMPORT
// ============================================

export async function bulkImportTowers(csvContent: string): Promise<BulkImportResult> {
  const startTime = Date.now();
  const errors: BulkImportError[] = [];
  const warnings: BulkImportWarning[] = [];
  let successCount = 0;

  try {
    const rows = parseCSV(csvContent);
    const objects = csvToObjects(rows);

    if (objects.length === 0) {
      return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
    }

    const validatedRows: ValidatedTowerRow[] = validateRowsWithSchema(
      objects,
      BulkTowerSchema,
      errors,
    );

    for (const data of validatedRows) {
      try {
        const projectId = await resolveProjectId(data.projectSlug);
        if (!projectId) {
          errors.push({
            rowNumber: data._rowNumber,
            field: "projectSlug",
            message: `Project with slug "${data.projectSlug}" not found`,
          });
          continue;
        }

        const phaseId = data.phaseName
          ? (
              await db
                .select({ id: projectPhases.id })
                .from(projectPhases)
                .where(
                  and(
                    eq(projectPhases.projectId, projectId),
                    eq(projectPhases.name, data.phaseName),
                  ),
                )
                .limit(1)
            )[0]?.id
          : null;

        const insertData = {
          projectId,
          phaseId,
          towerNumber: data.towerNumber,
          name: data.towerName || null,
          floorCount: data.floorCount ? parseInt(data.floorCount) : null,
          floorMin: data.floorMin ? parseInt(data.floorMin) : null,
          floorMax: data.floorMax ? parseInt(data.floorMax) : null,
        };

        if (data.action === "update") {
          const existing = await db
            .select({ id: projectTowers.id })
            .from(projectTowers)
            .where(
              and(
                eq(projectTowers.projectId, projectId),
                eq(projectTowers.towerNumber, data.towerNumber),
              ),
            )
            .limit(1);

          if (existing[0]) {
            await db
              .update(projectTowers)
              .set({ ...insertData, updatedAt: new Date() })
              .where(eq(projectTowers.id, existing[0].id));
          } else {
            await db.insert(projectTowers).values(insertData);
          }
        } else {
          const existing = await db
            .select({ id: projectTowers.id })
            .from(projectTowers)
            .where(
              and(
                eq(projectTowers.projectId, projectId),
                eq(projectTowers.towerNumber, data.towerNumber),
              ),
            )
            .limit(1);

          if (existing[0]) {
            addAlreadyExistsWarning(
              warnings,
              data._rowNumber,
              "Tower",
              "tower number",
              data.towerNumber,
            );
            successCount++;
            continue;
          }

          await db.insert(projectTowers).values(insertData);
        }

        successCount++;
      } catch (err) {
        errors.push({
          rowNumber: data._rowNumber,
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return buildImportResult(
      objects.length,
      successCount,
      errors,
      warnings,
      Date.now() - startTime,
    );
  } catch (error) {
    errors.push({
      rowNumber: 0,
      message: error instanceof Error ? error.message : "CSV parsing failed",
    });
    return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
  }
}

// ============================================
// BULK SALES PACKAGE (PROMOTION) IMPORT
// ============================================

export async function bulkImportSalesPackages(csvContent: string): Promise<BulkImportResult> {
  const startTime = Date.now();
  const errors: BulkImportError[] = [];
  const warnings: BulkImportWarning[] = [];
  let successCount = 0;

  try {
    const rows = parseCSV(csvContent);
    const objects = csvToObjects(rows);

    if (objects.length === 0) {
      return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
    }

    const validatedRows: ValidatedSalesPackageRow[] = validateRowsWithSchema(
      objects,
      BulkSalesPackageSchema,
      errors,
    );
    if (validatedRows.length === 0) {
      return buildImportResult(objects.length, 0, errors, warnings, Date.now() - startTime);
    }

    const buyerTypeMap = await buildCodeLookupMap(
      buyerTypes,
      validatedRows.map((r) => r.buyerTypeCode).filter(Boolean) as string[],
    );

    const projectCache = new Map<string, string | null>();
    const getProjectId = async (slug: string) => {
      if (!projectCache.has(slug)) projectCache.set(slug, await resolveProjectId(slug));
      return projectCache.get(slug)!;
    };

    for (const data of validatedRows) {
      try {
        const projectId = await getProjectId(data.projectSlug);
        if (!projectId) {
          errors.push({
            rowNumber: data._rowNumber,
            field: "projectSlug",
            message: `Project "${data.projectSlug}" not found`,
          });
          continue;
        }

        const buyerTypeId = data.buyerTypeCode
          ? (buyerTypeMap.get(data.buyerTypeCode) ?? null)
          : null;

        const insertData = {
          projectId,
          name: data.name,
          buyerTypeId,
          rebatePercentage: data.rebatePercentage ? String(data.rebatePercentage) : null,
          cashBackAmount: data.cashBackAmount ? String(data.cashBackAmount) : null,
          validFrom: data.validFrom || null,
          validTo: data.validTo || null,
          isActive: data.isActive,
        };

        const existing = await db
          .select({ id: salesPackages.id })
          .from(salesPackages)
          .where(and(eq(salesPackages.projectId, projectId), eq(salesPackages.name, data.name)))
          .limit(1);

        if (data.action === "update") {
          if (existing[0]) {
            await db
              .update(salesPackages)
              .set({ ...insertData, updatedAt: new Date() })
              .where(eq(salesPackages.id, existing[0].id));
          } else {
            await db.insert(salesPackages).values(insertData);
          }
        } else {
          if (existing[0]) {
            addAlreadyExistsWarning(warnings, data._rowNumber, "Sales package", "name", data.name);
            successCount++;
            continue;
          }
          await db.insert(salesPackages).values(insertData);
        }

        successCount++;
      } catch (err) {
        errors.push({
          rowNumber: data._rowNumber,
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return buildImportResult(
      objects.length,
      successCount,
      errors,
      warnings,
      Date.now() - startTime,
    );
  } catch (error) {
    errors.push({
      rowNumber: 0,
      message: error instanceof Error ? error.message : "CSV parsing failed",
    });
    return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
  }
}

// ============================================
// BULK TOWER FACING GROUP IMPORT
// ============================================

export async function bulkImportTowerFacingGroups(csvContent: string): Promise<BulkImportResult> {
  const startTime = Date.now();
  const errors: BulkImportError[] = [];
  const warnings: BulkImportWarning[] = [];
  let successCount = 0;

  try {
    const rows = parseCSV(csvContent);
    const objects = csvToObjects(rows);

    if (objects.length === 0) {
      return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
    }

    const validatedRows: ValidatedTowerFacingGroupRow[] = validateRowsWithSchema(
      objects,
      BulkTowerFacingGroupSchema,
      errors,
    );
    if (validatedRows.length === 0) {
      return buildImportResult(objects.length, 0, errors, warnings, Date.now() - startTime);
    }

    const projectCache = new Map<string, string | null>();
    const towerCache = new Map<string, string | null>();

    const getProjectId = async (slug: string) => {
      if (!projectCache.has(slug)) projectCache.set(slug, await resolveProjectId(slug));
      return projectCache.get(slug)!;
    };
    const getTowerId = async (projectId: string, num: string) => {
      const k = `${projectId}:${num}`;
      if (!towerCache.has(k)) {
        const r = await db
          .select({ id: projectTowers.id })
          .from(projectTowers)
          .where(and(eq(projectTowers.projectId, projectId), eq(projectTowers.towerNumber, num)))
          .limit(1);
        towerCache.set(k, r[0]?.id ?? null);
      }
      return towerCache.get(k)!;
    };

    for (const data of validatedRows) {
      try {
        const projectId = await getProjectId(data.projectSlug);
        if (!projectId) {
          errors.push({
            rowNumber: data._rowNumber,
            field: "projectSlug",
            message: `Project "${data.projectSlug}" not found`,
          });
          continue;
        }

        const towerId = await getTowerId(projectId, data.towerNumber);
        if (!towerId) {
          errors.push({
            rowNumber: data._rowNumber,
            field: "towerNumber",
            message: `Tower "${data.towerNumber}" not found in project "${data.projectSlug}"`,
          });
          continue;
        }

        const insertData = {
          towerId,
          key: data.key,
          label: data.label,
          sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0,
        };

        const existing = await db
          .select({ id: towerFacingGroups.id })
          .from(towerFacingGroups)
          .where(and(eq(towerFacingGroups.towerId, towerId), eq(towerFacingGroups.key, data.key)))
          .limit(1);

        if (data.action === "update") {
          if (existing[0]) {
            await db
              .update(towerFacingGroups)
              .set({ ...insertData, updatedAt: new Date() })
              .where(eq(towerFacingGroups.id, existing[0].id));
          } else {
            await db.insert(towerFacingGroups).values(insertData);
          }
        } else {
          if (existing[0]) {
            addAlreadyExistsWarning(warnings, data._rowNumber, "Facing group", "key", data.key);
            successCount++;
            continue;
          }
          await db.insert(towerFacingGroups).values(insertData);
        }

        successCount++;
      } catch (err) {
        errors.push({
          rowNumber: data._rowNumber,
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return buildImportResult(
      objects.length,
      successCount,
      errors,
      warnings,
      Date.now() - startTime,
    );
  } catch (error) {
    errors.push({
      rowNumber: 0,
      message: error instanceof Error ? error.message : "CSV parsing failed",
    });
    return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
  }
}

// ============================================
// BULK TOWER STACK IMPORT
// ============================================

export async function bulkImportTowerStacks(csvContent: string): Promise<BulkImportResult> {
  const startTime = Date.now();
  const errors: BulkImportError[] = [];
  const warnings: BulkImportWarning[] = [];
  let successCount = 0;

  try {
    const rows = parseCSV(csvContent);
    const objects = csvToObjects(rows);

    if (objects.length === 0) {
      return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
    }

    const validatedRows: ValidatedTowerStackRow[] = validateRowsWithSchema(
      objects,
      BulkTowerStackSchema,
      errors,
    );
    if (validatedRows.length === 0) {
      return buildImportResult(objects.length, 0, errors, warnings, Date.now() - startTime);
    }

    const projectCache = new Map<string, string | null>();
    const towerCache = new Map<string, string | null>();
    const layoutCache = new Map<string, string | null>();

    const getProjectId = async (slug: string) => {
      if (!projectCache.has(slug)) projectCache.set(slug, await resolveProjectId(slug));
      return projectCache.get(slug)!;
    };
    const getTowerId = async (projectId: string, num: string) => {
      const k = `${projectId}:${num}`;
      if (!towerCache.has(k)) {
        const r = await db
          .select({ id: projectTowers.id })
          .from(projectTowers)
          .where(and(eq(projectTowers.projectId, projectId), eq(projectTowers.towerNumber, num)))
          .limit(1);
        towerCache.set(k, r[0]?.id ?? null);
      }
      return towerCache.get(k)!;
    };
    const getLayoutId = async (projectId: string, code: string) => {
      const k = `${projectId}:${code}`;
      if (!layoutCache.has(k)) {
        const r = await db
          .select({ id: projectLayouts.id })
          .from(projectLayouts)
          .where(and(eq(projectLayouts.projectId, projectId), eq(projectLayouts.code, code)))
          .limit(1);
        layoutCache.set(k, r[0]?.id ?? null);
      }
      return layoutCache.get(k)!;
    };

    for (const data of validatedRows) {
      try {
        const projectId = await getProjectId(data.projectSlug);
        if (!projectId) {
          errors.push({
            rowNumber: data._rowNumber,
            field: "projectSlug",
            message: `Project "${data.projectSlug}" not found`,
          });
          continue;
        }

        const towerId = await getTowerId(projectId, data.towerNumber);
        if (!towerId) {
          errors.push({
            rowNumber: data._rowNumber,
            field: "towerNumber",
            message: `Tower "${data.towerNumber}" not found in project "${data.projectSlug}"`,
          });
          continue;
        }

        const layoutId = data.layoutCode ? await getLayoutId(projectId, data.layoutCode) : null;

        const insertData = {
          towerId,
          stackNo: data.stackNo,
          layoutId: layoutId ?? null,
          layoutCode: data.layoutCode || null,
          builtUpSqft: data.builtUpSqft ? String(data.builtUpSqft) : null,
          facingGroupKey: data.facingGroupKey || null,
          sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0,
        };

        const existing = await db
          .select({ id: towerStacks.id })
          .from(towerStacks)
          .where(and(eq(towerStacks.towerId, towerId), eq(towerStacks.stackNo, data.stackNo)))
          .limit(1);

        if (data.action === "update") {
          if (existing[0]) {
            await db
              .update(towerStacks)
              .set({ ...insertData, updatedAt: new Date() })
              .where(eq(towerStacks.id, existing[0].id));
          } else {
            await db.insert(towerStacks).values(insertData);
          }
        } else {
          if (existing[0]) {
            addAlreadyExistsWarning(warnings, data._rowNumber, "Stack", "stackNo", data.stackNo);
            successCount++;
            continue;
          }
          await db.insert(towerStacks).values(insertData);
        }

        successCount++;
      } catch (err) {
        errors.push({
          rowNumber: data._rowNumber,
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return buildImportResult(
      objects.length,
      successCount,
      errors,
      warnings,
      Date.now() - startTime,
    );
  } catch (error) {
    errors.push({
      rowNumber: 0,
      message: error instanceof Error ? error.message : "CSV parsing failed",
    });
    return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
  }
}

// ============================================
// BULK TOWER SPECIAL FLOOR IMPORT
// ============================================

export async function bulkImportTowerSpecialFloors(csvContent: string): Promise<BulkImportResult> {
  const startTime = Date.now();
  const errors: BulkImportError[] = [];
  const warnings: BulkImportWarning[] = [];
  let successCount = 0;

  try {
    const rows = parseCSV(csvContent);
    const objects = csvToObjects(rows);

    if (objects.length === 0) {
      return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
    }

    const validatedRows: ValidatedTowerSpecialFloorRow[] = validateRowsWithSchema(
      objects,
      BulkTowerSpecialFloorSchema,
      errors,
    );
    if (validatedRows.length === 0) {
      return buildImportResult(objects.length, 0, errors, warnings, Date.now() - startTime);
    }

    const projectCache = new Map<string, string | null>();
    const towerCache = new Map<string, string | null>();

    const getProjectId = async (slug: string) => {
      if (!projectCache.has(slug)) projectCache.set(slug, await resolveProjectId(slug));
      return projectCache.get(slug)!;
    };
    const getTowerId = async (projectId: string, num: string) => {
      const k = `${projectId}:${num}`;
      if (!towerCache.has(k)) {
        const r = await db
          .select({ id: projectTowers.id })
          .from(projectTowers)
          .where(and(eq(projectTowers.projectId, projectId), eq(projectTowers.towerNumber, num)))
          .limit(1);
        towerCache.set(k, r[0]?.id ?? null);
      }
      return towerCache.get(k)!;
    };

    for (const data of validatedRows) {
      try {
        const projectId = await getProjectId(data.projectSlug);
        if (!projectId) {
          errors.push({
            rowNumber: data._rowNumber,
            field: "projectSlug",
            message: `Project "${data.projectSlug}" not found`,
          });
          continue;
        }

        const towerId = await getTowerId(projectId, data.towerNumber);
        if (!towerId) {
          errors.push({
            rowNumber: data._rowNumber,
            field: "towerNumber",
            message: `Tower "${data.towerNumber}" not found in project "${data.projectSlug}"`,
          });
          continue;
        }

        const insertData = {
          towerId,
          floorKind: data.floorKind,
          floorNumber: data.floorNumber ? parseInt(data.floorNumber) : null,
          floorLabel: data.floorLabel,
          facilityLabel: data.facilityLabel || null,
          sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0,
        };

        const existing = await db
          .select({ id: towerSpecialFloors.id })
          .from(towerSpecialFloors)
          .where(
            and(
              eq(towerSpecialFloors.towerId, towerId),
              eq(towerSpecialFloors.floorKind, data.floorKind),
              eq(towerSpecialFloors.floorLabel, data.floorLabel),
            ),
          )
          .limit(1);

        if (data.action === "update") {
          if (existing[0]) {
            await db
              .update(towerSpecialFloors)
              .set({ ...insertData, updatedAt: new Date() })
              .where(eq(towerSpecialFloors.id, existing[0].id));
          } else {
            await db.insert(towerSpecialFloors).values(insertData);
          }
        } else {
          if (existing[0]) {
            addAlreadyExistsWarning(
              warnings,
              data._rowNumber,
              "Special floor",
              "floorLabel",
              data.floorLabel,
            );
            successCount++;
            continue;
          }
          await db.insert(towerSpecialFloors).values(insertData);
        }

        successCount++;
      } catch (err) {
        errors.push({
          rowNumber: data._rowNumber,
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return buildImportResult(
      objects.length,
      successCount,
      errors,
      warnings,
      Date.now() - startTime,
    );
  } catch (error) {
    errors.push({
      rowNumber: 0,
      message: error instanceof Error ? error.message : "CSV parsing failed",
    });
    return buildImportResult(0, 0, errors, warnings, Date.now() - startTime);
  }
}
