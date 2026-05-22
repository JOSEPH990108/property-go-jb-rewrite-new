// src\lib\bulk-import-schema.ts
import { z } from 'zod';

const emptyStringToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }
    return value;
  }, schema.optional());

const optionalNumericString = (message: string) =>
  emptyStringToUndefined(z.string().regex(/^-?\d+(\.\d+)?$/, message));

const optionalIntegerString = (message: string) =>
  emptyStringToUndefined(z.string().regex(/^\d+$/, message));

const optionalYesNoString = (defaultValue: boolean, falseValue: string) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') return value;
    const normalized = value.trim();
    return normalized === '' ? undefined : normalized;
  }, z.string().regex(/^(yes|no)$/i, 'Value must be yes or no').optional())
    .transform((value) => {
      if (!value) return defaultValue;
      return value.toLowerCase() !== falseValue;
    });

const optionalBooleanString = (defaultValue: boolean) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') return value;
    const normalized = value.trim();
    return normalized === '' ? undefined : normalized;
  }, z.string().regex(/^(true|false|yes|no)$/i, 'Value must be true, false, yes, or no').optional())
    .transform((value) => {
      if (!value) return defaultValue;
      return value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
    });

// ============================================
// BULK IMPORT VALIDATION SCHEMAS
// ============================================

/**
 * Project bulk import schema
 * Supports creating/updating projects with core data
 */
export const BulkProjectSchema = z.object({
  action: z.enum(['create', 'update']).default('create'),
  slug: z.string().min(1, 'Slug is required').max(200),
  name: z.string().min(1, 'Name is required').max(200),
  displayName: emptyStringToUndefined(z.string().max(200)),
  legalName: emptyStringToUndefined(z.string().max(200)),
  description: emptyStringToUndefined(z.string()),
  
  // References (by code or name)
  developerSlug: z.string().min(1, 'Developer slug is required'),
  propertyCategoryCode: emptyStringToUndefined(z.string()),
  propertyTypeCode: emptyStringToUndefined(z.string()),
  projectStatusCode: emptyStringToUndefined(z.string()),
  tenureTypeCode: z.string().min(1, 'Tenure type code is required'),
  titleTypeCode: emptyStringToUndefined(z.string()),
  
  // Location
  stateName: emptyStringToUndefined(z.string()),
  regionName: emptyStringToUndefined(z.string()),
  areaName: emptyStringToUndefined(z.string()),
  address: emptyStringToUndefined(z.string()),
  latitude: optionalNumericString('Latitude must be a valid number'),
  longitude: optionalNumericString('Longitude must be a valid number'),
  
  // Metrics
  totalUnits: optionalIntegerString('Total units must be a whole number'),
  launchYear: emptyStringToUndefined(z.string().regex(/^\d{4}$/, 'Launch year must be a 4-digit year')),
  
  // Fees
  bookingFee: optionalNumericString('Booking fee must be a valid number'),
  maintenanceFeePerSqft: optionalNumericString('Maintenance fee per sqft must be a valid number'),
  
  // Status
  isPublished: optionalYesNoString(false, 'no'),
  isForeignerEligible: optionalYesNoString(true, 'no'),
  tenureExpiryDate: emptyStringToUndefined(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tenure expiry date must be in YYYY-MM-DD format')),
});

export const BulkDeveloperSchema = z.object({
  action: z.enum(['create', 'update']).default('create'),
  slug: z.string().min(1, 'Slug is required').max(200),
  name: z.string().min(1, 'Name is required').max(200),
  legalName: emptyStringToUndefined(z.string().max(200)),
  description: emptyStringToUndefined(z.string()),
  isActive: optionalBooleanString(true),
});

/**
 * Project Layout bulk import schema
 */
export const BulkProjectLayoutSchema = z.object({
  action: z.enum(['create', 'update']).default('create'),
  projectSlug: z.string().min(1, 'Project slug is required'),
  layoutCode: z.string().min(1, 'Layout code is required').max(50),
  layoutName: z.string().min(1, 'Layout name is required').max(100),
  
  bedrooms: z.string().regex(/^\d+$/, 'Bedrooms must be a number'),
  bathrooms: z.string().regex(/^\d+$/, 'Bathrooms must be a number'),
  builtUpSqft: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Built-up area must be a number'),
  
  studyRooms: z.string().optional().default('0'),
  hasBalcony: z.string().optional().transform(val => val?.toLowerCase() === 'yes'),
  hasYard: z.string().optional().transform(val => val?.toLowerCase() === 'yes'),
  virtualTourUrl: z.string().url().optional(),
});

/**
 * Unit bulk import schema
 */
export const BulkUnitSchema = z.object({
  action: z.enum(['create', 'update']).default('create'),
  projectSlug: z.string().min(1, 'Project slug is required'),
  layoutCode: z.string().optional(),
  towerNumber: z.string().optional(),
  phaseName: z.string().optional(),
  
  unitNo: z.string().min(1, 'Unit number is required').max(50),
  floor: z.string().optional(),
  stack: z.string().optional(),
  displaySequence: z.string().optional(),
  
  builtUpSqft: z.string().optional(),
  landAreaSqft: z.string().optional(),
  dimensionText: z.string().optional(),
  
  facing: z.string().optional(),
  positionType: z.string().optional(), // code or name
  
  carparkCount: z.string().optional().default('1'),
  carparkLotNo: z.string().optional(),
  carparkType: z.string().optional(),
  
  lotTypeCode: z.string().min(1, 'Lot type code is required'),
  bookingStatusCode: z.string().min(1, 'Booking status code is required'),
  
  basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Base price must be a valid number'),
  finalPrice: z.string().optional(),
});

/**
 * Phase bulk import schema
 */
export const BulkPhaseSchema = z.object({
  action: z.enum(['create', 'update']).default('create'),
  projectSlug: z.string().min(1, 'Project slug is required'),
  phaseCode: z.string().min(1, 'Phase code is required').max(50),
  phaseName: z.string().min(1, 'Phase name is required').max(100),
  
  completionDate: z.string().optional(),
  constructionStatusCode: z.string().optional(),
});

/**
 * Tower bulk import schema
 */
export const BulkTowerSchema = z.object({
  action: z.enum(['create', 'update']).default('create'),
  projectSlug: z.string().min(1, 'Project slug is required'),
  phaseName: z.string().optional(),

  towerNumber: z.string().min(1, 'Tower number is required').max(50),
  towerName: z.string().max(100).optional(),
  floorCount: optionalIntegerString('Floor count must be a whole number'),
  floorMin: optionalIntegerString('Floor min must be a whole number'),
  floorMax: optionalIntegerString('Floor max must be a whole number'),
});

/**
 * Sales / promotion package bulk import schema
 */
export const BulkSalesPackageSchema = z.object({
  action: z.enum(['create', 'update']).default('create'),
  projectSlug: z.string().min(1, 'Project slug is required'),
  name: z.string().min(1, 'Package name is required').max(200),
  buyerTypeCode: emptyStringToUndefined(z.string()),
  rebatePercentage: optionalNumericString('Rebate percentage must be a valid number'),
  cashBackAmount: optionalNumericString('Cash back amount must be a valid number'),
  validFrom: emptyStringToUndefined(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'validFrom must be YYYY-MM-DD')),
  validTo: emptyStringToUndefined(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'validTo must be YYYY-MM-DD')),
  isActive: optionalBooleanString(true),
});

/**
 * Tower facing group bulk import schema (unit chart column-header bands)
 */
export const BulkTowerFacingGroupSchema = z.object({
  action: z.enum(['create', 'update']).default('create'),
  projectSlug: z.string().min(1, 'Project slug is required'),
  towerNumber: z.string().min(1, 'Tower number is required'),
  key: z.string().min(1, 'Facing group key is required').max(50),
  label: z.string().min(1, 'Facing group label is required').max(200),
  sortOrder: optionalIntegerString('Sort order must be a whole number'),
});

/**
 * Tower stack bulk import schema (one row per chart grid column)
 */
export const BulkTowerStackSchema = z.object({
  action: z.enum(['create', 'update']).default('create'),
  projectSlug: z.string().min(1, 'Project slug is required'),
  towerNumber: z.string().min(1, 'Tower number is required'),
  stackNo: z.string().min(1, 'Stack number is required').max(10),
  layoutCode: emptyStringToUndefined(z.string().max(50)),
  builtUpSqft: optionalNumericString('Built-up sqft must be a valid number'),
  facingGroupKey: emptyStringToUndefined(z.string().max(50)),
  sortOrder: optionalIntegerString('Sort order must be a whole number'),
});

/**
 * Tower special floor bulk import schema (breaktank + facility/podium rows)
 */
export const BulkTowerSpecialFloorSchema = z.object({
  action: z.enum(['create', 'update']).default('create'),
  projectSlug: z.string().min(1, 'Project slug is required'),
  towerNumber: z.string().min(1, 'Tower number is required'),
  floorKind: z.enum(['breaktank', 'facility'], { message: "floorKind must be 'breaktank' or 'facility'" }),
  floorNumber: optionalIntegerString('Floor number must be a whole number'),
  floorLabel: z.string().min(1, 'Floor label is required').max(50),
  facilityLabel: emptyStringToUndefined(z.string().max(200)),
  sortOrder: optionalIntegerString('Sort order must be a whole number'),
});

// ============================================
// RESULT TYPES
// ============================================

export interface BulkImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors: BulkImportError[];
  warnings: BulkImportWarning[];
  duration: number; // ms
}

export interface BulkImportError {
  rowNumber: number;
  field?: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface BulkImportWarning {
  rowNumber: number;
  message: string;
}

// ============================================
// HELPER TYPES FOR UI
// ============================================

export enum BulkImportEntityType {
  DEVELOPER = 'developer',
  PROJECT = 'project',
  LAYOUT = 'layout',
  UNIT = 'unit',
  PHASE = 'phase',
  TOWER = 'tower',
  SALES_PACKAGE = 'sales_package',
  TOWER_FACING_GROUP = 'tower_facing_group',
  TOWER_STACK = 'tower_stack',
  TOWER_SPECIAL_FLOOR = 'tower_special_floor',
}

export interface BulkImportConfig {
  entityType: BulkImportEntityType;
  mode: 'create' | 'update' | 'both';
  skipOnError: boolean;
  transactionMode: 'all-or-nothing' | 'partial';
  validateOnly: boolean;
}

export type BulkRowSchema =
  | typeof BulkDeveloperSchema
  | typeof BulkProjectSchema
  | typeof BulkProjectLayoutSchema
  | typeof BulkUnitSchema
  | typeof BulkPhaseSchema
  | typeof BulkTowerSchema
  | typeof BulkSalesPackageSchema
  | typeof BulkTowerFacingGroupSchema
  | typeof BulkTowerStackSchema
  | typeof BulkTowerSpecialFloorSchema;
