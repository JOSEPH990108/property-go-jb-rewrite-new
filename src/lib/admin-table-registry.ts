// src/lib/admin-table-registry.ts
// Central registry mapping every DB table to its display config, column overrides, and FK references.

import * as schema from '@/db/schema';

// ── Types ────────────────────────────────────────────────────────────────────

export type FieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'date' | 'datetime' | 'decimal' | 'json' | 'select';

export type ForeignKeyRef = {
  /** Key in TABLE_MAP of the referenced table */
  table: string;
  /** Column shown in the dropdown label */
  labelColumn: string;
  /** Column used as the value (default "id") */
  valueColumn?: string;
};

export type ColumnOverride = {
  label?: string;
  hidden?: boolean;        // hide from both table and form
  tableHidden?: boolean;   // hide from table columns only
  formHidden?: boolean;    // hide from create/edit form
  readOnly?: boolean;
  fieldType?: FieldType;
  foreignKey?: ForeignKeyRef;
  options?: { value: string; label: string }[];
};

export type TableConfig = {
  key: string;
  label: string;
  description?: string;
  group: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any;
  primaryKey?: string;        // defaults to "id"
  compositePK?: string[];     // for junction tables
  labelColumn?: string;       // used when this table is FK-referenced by others
  searchColumns?: string[];
  defaultSort?: { column: string; direction: 'asc' | 'desc' };
  columnOverrides?: Record<string, ColumnOverride>;
};

// ── Shared column overrides (reused patterns) ────────────────────────────────

const BASE_COL_OVERRIDES: Record<string, ColumnOverride> = {
  id: { formHidden: true, readOnly: true },
  createdAt: { formHidden: true, readOnly: true, label: 'Created' },
  updatedAt: { formHidden: true, readOnly: true, label: 'Updated' },
  deletedAt: { hidden: true },
};

const LOOKUP_OVERRIDES: Record<string, ColumnOverride> = {
  ...BASE_COL_OVERRIDES,
  code: { label: 'Code' },
  name: { label: 'Name' },
  description: { label: 'Description', fieldType: 'textarea', tableHidden: true },
  color: { label: 'Color' },
  icon: { label: 'Icon' },
  sortOrder: { label: 'Sort Order', fieldType: 'number' },
  isActive: { label: 'Active', fieldType: 'boolean' },
};

const SLUG_OVERRIDES: Record<string, ColumnOverride> = {
  ...BASE_COL_OVERRIDES,
  slug: { label: 'Slug' },
  name: { label: 'Name' },
  description: { label: 'Description', fieldType: 'textarea', tableHidden: true },
  isActive: { label: 'Active', fieldType: 'boolean' },
};

// ── Helper to build a lookup table config ────────────────────────────────────

function lookupTable(
  key: string,
  label: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  extra?: Partial<TableConfig>,
): TableConfig {
  return {
    key,
    label,
    group: 'lookups',
    table,
    labelColumn: 'name',
    searchColumns: ['code', 'name'],
    defaultSort: { column: 'sortOrder', direction: 'asc' },
    columnOverrides: { ...LOOKUP_OVERRIDES },
    ...extra,
  };
}

function slugTable(
  key: string,
  label: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  extra?: Partial<TableConfig>,
): TableConfig {
  return {
    key,
    label,
    group: 'lookups',
    table,
    labelColumn: 'name',
    searchColumns: ['slug', 'name'],
    defaultSort: { column: 'name', direction: 'asc' },
    columnOverrides: { ...SLUG_OVERRIDES },
    ...extra,
  };
}

// ── Registry ─────────────────────────────────────────────────────────────────

export const TABLE_REGISTRY: Record<string, TableConfig> = {
  // ───── Lookups ─────────────────────────────────────────────────────────────
  propertyCategories: lookupTable('propertyCategories', 'Property Categories', schema.propertyCategories),
  propertyTypes: lookupTable('propertyTypes', 'Property Types', schema.propertyTypes, {
    columnOverrides: {
      ...LOOKUP_OVERRIDES,
      slug: { label: 'Slug' },
      categoryId: { label: 'Category', foreignKey: { table: 'propertyCategories', labelColumn: 'name' } },
    },
  }),
  tenureTypes: lookupTable('tenureTypes', 'Tenure Types', schema.tenureTypes),
  titleTypes: lookupTable('titleTypes', 'Title Types', schema.titleTypes),
  lotTypes: lookupTable('lotTypes', 'Lot Types', schema.lotTypes, {
    columnOverrides: {
      ...LOOKUP_OVERRIDES,
      eligibility: { label: 'Eligibility', fieldType: 'textarea', tableHidden: true },
    },
  }),
  unitPositions: lookupTable('unitPositions', 'Unit Positions', schema.unitPositions),
  projectStatuses: lookupTable('projectStatuses', 'Project Statuses', schema.projectStatuses),
  constructionStatuses: lookupTable('constructionStatuses', 'Construction Statuses', schema.constructionStatuses),
  bookingStatuses: lookupTable('bookingStatuses', 'Booking Statuses', schema.bookingStatuses),
  appointmentStatuses: lookupTable('appointmentStatuses', 'Appointment Statuses', schema.appointmentStatuses),
  financingTypes: lookupTable('financingTypes', 'Financing Types', schema.financingTypes),
  buyerTypes: lookupTable('buyerTypes', 'Buyer Types', schema.buyerTypes),
  promotionTypes: lookupTable('promotionTypes', 'Promotion Types', schema.promotionTypes),
  amenities: slugTable('amenities', 'Amenities', schema.amenities, {
    columnOverrides: {
      ...SLUG_OVERRIDES,
      icon: { label: 'Icon' },
    },
  }),
  tags: slugTable('tags', 'Tags', schema.tags),
  mediaTypes: lookupTable('mediaTypes', 'Media Types', schema.mediaTypes),
  roles: lookupTable('roles', 'Roles', schema.roles),

  // ───── Locations ───────────────────────────────────────────────────────────
  states: {
    key: 'states',
    label: 'States',
    group: 'locations',
    table: schema.states,
    labelColumn: 'name',
    searchColumns: ['name', 'slug'],
    defaultSort: { column: 'name', direction: 'asc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      name: { label: 'Name' },
      slug: { label: 'Slug' },
      country: { label: 'Country' },
    },
  },
  regions: {
    key: 'regions',
    label: 'Regions',
    group: 'locations',
    table: schema.regions,
    labelColumn: 'name',
    searchColumns: ['name', 'slug'],
    defaultSort: { column: 'name', direction: 'asc' },
    columnOverrides: {
      ...SLUG_OVERRIDES,
      stateId: { label: 'State', foreignKey: { table: 'states', labelColumn: 'name' } },
    },
  },
  areas: {
    key: 'areas',
    label: 'Areas',
    group: 'locations',
    table: schema.areas,
    labelColumn: 'name',
    searchColumns: ['name', 'slug'],
    defaultSort: { column: 'name', direction: 'asc' },
    columnOverrides: {
      ...SLUG_OVERRIDES,
      regionId: { label: 'Region', foreignKey: { table: 'regions', labelColumn: 'name' } },
    },
  },

  // ───── Professional Panels ─────────────────────────────────────────────────
  panelLawyers: {
    key: 'panelLawyers',
    label: 'Panel Lawyers',
    group: 'panels',
    table: schema.panelLawyers,
    labelColumn: 'name',
    searchColumns: ['name', 'firmName', 'email'],
    defaultSort: { column: 'name', direction: 'asc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      name: { label: 'Name' },
      firmName: { label: 'Firm' },
      email: { label: 'Email' },
      phone: { label: 'Phone' },
      address: { label: 'Address', fieldType: 'textarea', tableHidden: true },
      isActive: { label: 'Active', fieldType: 'boolean' },
    },
  },
  panelBankers: {
    key: 'panelBankers',
    label: 'Panel Bankers',
    group: 'panels',
    table: schema.panelBankers,
    labelColumn: 'bankerName',
    searchColumns: ['bankName', 'bankerName', 'email'],
    defaultSort: { column: 'bankName', direction: 'asc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      bankName: { label: 'Bank' },
      bankerName: { label: 'Banker Name' },
      branch: { label: 'Branch' },
      phone: { label: 'Phone' },
      email: { label: 'Email' },
      isActive: { label: 'Active', fieldType: 'boolean' },
    },
  },

  // ───── Projects Hierarchy ──────────────────────────────────────────────────
  developers: {
    key: 'developers',
    label: 'Developers',
    group: 'projects',
    table: schema.developers,
    labelColumn: 'name',
    searchColumns: ['name', 'slug', 'legalName'],
    defaultSort: { column: 'name', direction: 'asc' },
    columnOverrides: {
      ...SLUG_OVERRIDES,
      legalName: { label: 'Legal Name', tableHidden: true },
      countryCode: { label: 'Country Code' },
      isFeatured: { label: 'Featured', fieldType: 'boolean' },
      logoFileId: { label: 'Logo File', foreignKey: { table: 'files', labelColumn: 'url' }, tableHidden: true },
    },
  },
  projects: {
    key: 'projects',
    label: 'Projects',
    group: 'projects',
    table: schema.projects,
    labelColumn: 'name',
    searchColumns: ['name', 'slug', 'displayName'],
    defaultSort: { column: 'name', direction: 'asc' },
    columnOverrides: {
      ...SLUG_OVERRIDES,
      displayName: { label: 'Display Name', tableHidden: true },
      legalName: { label: 'Legal Name', tableHidden: true },
      developerId: { label: 'Developer', foreignKey: { table: 'developers', labelColumn: 'name' } },
      propertyCategoryId: { label: 'Category', foreignKey: { table: 'propertyCategories', labelColumn: 'name' }, tableHidden: true },
      propertyTypeId: { label: 'Type', foreignKey: { table: 'propertyTypes', labelColumn: 'name' }, tableHidden: true },
      projectStatusId: { label: 'Status', foreignKey: { table: 'projectStatuses', labelColumn: 'name' } },
      tenureTypeId: { label: 'Tenure', foreignKey: { table: 'tenureTypes', labelColumn: 'name' }, tableHidden: true },
      titleTypeId: { label: 'Title Type', foreignKey: { table: 'titleTypes', labelColumn: 'name' }, tableHidden: true },
      tenureExpiryDate: { label: 'Tenure Expiry', fieldType: 'date', tableHidden: true },
      regionId: { label: 'Region', foreignKey: { table: 'regions', labelColumn: 'name' } },
      areaId: { label: 'Area', foreignKey: { table: 'areas', labelColumn: 'name' }, tableHidden: true },
      address: { label: 'Address', fieldType: 'textarea', tableHidden: true },
      latitude: { label: 'Latitude', fieldType: 'decimal', tableHidden: true },
      longitude: { label: 'Longitude', fieldType: 'decimal', tableHidden: true },
      bookingFee: { label: 'Booking Fee', fieldType: 'decimal', tableHidden: true },
      maintenanceFeePerSqft: { label: 'Maintenance $/sqft', fieldType: 'decimal', tableHidden: true },
      isForeignerEligible: { label: 'Foreigner Eligible', fieldType: 'boolean', tableHidden: true },
      foreignerEligibility: { label: 'Foreigner Rules', fieldType: 'json', hidden: true },
      totalUnits: { label: 'Total Units', fieldType: 'number' },
      launchYear: { label: 'Launch Year', fieldType: 'number', tableHidden: true },
      featuredFileId: { label: 'Featured Image', foreignKey: { table: 'files', labelColumn: 'url' }, hidden: true },
      isHotDeal: { label: 'Hot Deal', fieldType: 'boolean', tableHidden: true },
      isPublished: { label: 'Published', fieldType: 'boolean' },
      basePrice: { label: 'Base Price', fieldType: 'decimal', tableHidden: true },
    },
  },
  projectPhases: {
    key: 'projectPhases',
    label: 'Project Phases',
    group: 'projects',
    table: schema.projectPhases,
    labelColumn: 'name',
    searchColumns: ['name', 'phaseCode'],
    defaultSort: { column: 'name', direction: 'asc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      projectId: { label: 'Project', foreignKey: { table: 'projects', labelColumn: 'name' } },
      name: { label: 'Phase Name' },
      phaseCode: { label: 'Phase Code' },
      completionDate: { label: 'Completion Date', fieldType: 'date' },
      constructionStatusId: { label: 'Construction Status', foreignKey: { table: 'constructionStatuses', labelColumn: 'name' } },
    },
  },
  projectTowers: {
    key: 'projectTowers',
    label: 'Project Towers',
    group: 'projects',
    table: schema.projectTowers,
    labelColumn: 'name',
    searchColumns: ['name', 'towerNumber'],
    defaultSort: { column: 'name', direction: 'asc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      projectId: { label: 'Project', foreignKey: { table: 'projects', labelColumn: 'name' } },
      phaseId: { label: 'Phase', foreignKey: { table: 'projectPhases', labelColumn: 'name' } },
      towerNumber: { label: 'Tower Number' },
      name: { label: 'Tower Name' },
      floorCount: { label: 'Floor Count', fieldType: 'number' },
      floorMin: { label: 'Floor Min', fieldType: 'number' },
      floorMax: { label: 'Floor Max', fieldType: 'number' },
    },
  },
  towerFacingGroups: {
    key: 'towerFacingGroups',
    label: 'Tower Facing Groups',
    group: 'projects',
    table: schema.towerFacingGroups,
    labelColumn: 'label',
    searchColumns: ['key', 'label'],
    defaultSort: { column: 'sortOrder', direction: 'asc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      towerId: { label: 'Tower', foreignKey: { table: 'projectTowers', labelColumn: 'name' } },
      key: { label: 'Key' },
      label: { label: 'Label' },
      sortOrder: { label: 'Sort Order', fieldType: 'number' },
    },
  },
  towerStacks: {
    key: 'towerStacks',
    label: 'Tower Stacks',
    group: 'projects',
    table: schema.towerStacks,
    labelColumn: 'stackNo',
    searchColumns: ['stackNo', 'layoutCode'],
    defaultSort: { column: 'sortOrder', direction: 'asc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      towerId: { label: 'Tower', foreignKey: { table: 'projectTowers', labelColumn: 'name' } },
      stackNo: { label: 'Stack No' },
      layoutId: { label: 'Layout', foreignKey: { table: 'projectLayouts', labelColumn: 'code' } },
      layoutCode: { label: 'Layout Code' },
      builtUpSqft: { label: 'Built-Up (sqft)', fieldType: 'decimal' },
      facingGroupKey: { label: 'Facing Group Key' },
      sortOrder: { label: 'Sort Order', fieldType: 'number' },
    },
  },
  towerSpecialFloors: {
    key: 'towerSpecialFloors',
    label: 'Tower Special Floors',
    group: 'projects',
    table: schema.towerSpecialFloors,
    labelColumn: 'floorLabel',
    searchColumns: ['floorLabel', 'facilityLabel'],
    defaultSort: { column: 'sortOrder', direction: 'asc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      towerId: { label: 'Tower', foreignKey: { table: 'projectTowers', labelColumn: 'name' } },
      floorKind: {
        label: 'Floor Kind',
        fieldType: 'select',
        options: [
          { value: 'breaktank', label: 'Breaktank' },
          { value: 'facility', label: 'Facility' },
        ],
      },
      floorNumber: { label: 'Floor Number', fieldType: 'number' },
      floorLabel: { label: 'Floor Label' },
      facilityLabel: { label: 'Facility Label' },
      sortOrder: { label: 'Sort Order', fieldType: 'number' },
    },
  },
  projectLayouts: {
    key: 'projectLayouts',
    label: 'Project Layouts',
    group: 'projects',
    table: schema.projectLayouts,
    labelColumn: 'code',
    searchColumns: ['code', 'name'],
    defaultSort: { column: 'code', direction: 'asc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      projectId: { label: 'Project', foreignKey: { table: 'projects', labelColumn: 'name' } },
      code: { label: 'Code' },
      name: { label: 'Name' },
      builtUpSqft: { label: 'Built-Up (sqft)', fieldType: 'decimal' },
      bedrooms: { label: 'Bedrooms', fieldType: 'number' },
      bathrooms: { label: 'Bathrooms', fieldType: 'number' },
      studyRooms: { label: 'Study Rooms', fieldType: 'number' },
      hasBalcony: { label: 'Balcony', fieldType: 'boolean' },
      hasYard: { label: 'Yard', fieldType: 'boolean' },
      floorPlanFileId: { label: 'Floor Plan File', foreignKey: { table: 'files', labelColumn: 'url' }, hidden: true },
      virtualTourUrl: { label: 'Virtual Tour URL', tableHidden: true },
    },
  },

  // ───── Units ───────────────────────────────────────────────────────────────
  units: {
    key: 'units',
    label: 'Units',
    group: 'units',
    table: schema.units,
    labelColumn: 'unitNo',
    searchColumns: ['unitNo', 'streetName'],
    defaultSort: { column: 'unitNo', direction: 'asc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      projectId: { label: 'Project', foreignKey: { table: 'projects', labelColumn: 'name' } },
      layoutId: { label: 'Layout', foreignKey: { table: 'projectLayouts', labelColumn: 'code' }, tableHidden: true },
      towerId: { label: 'Tower', foreignKey: { table: 'projectTowers', labelColumn: 'name' }, tableHidden: true },
      phaseId: { label: 'Phase', foreignKey: { table: 'projectPhases', labelColumn: 'name' }, tableHidden: true },
      unitNo: { label: 'Unit No' },
      floor: { label: 'Floor', fieldType: 'number' },
      stack: { label: 'Stack' },
      streetName: { label: 'Street Name', tableHidden: true },
      displaySequence: { label: 'Display Seq', fieldType: 'number', tableHidden: true },
      builtUpSqft: { label: 'Built-Up (sqft)', fieldType: 'decimal' },
      landAreaSqft: { label: 'Land Area (sqft)', fieldType: 'decimal', tableHidden: true },
      dimensionText: { label: 'Dimensions', tableHidden: true },
      facing: { label: 'Facing', tableHidden: true },
      positionTypeId: { label: 'Position', foreignKey: { table: 'unitPositions', labelColumn: 'name' }, tableHidden: true },
      carparkCount: { label: 'Carparks', fieldType: 'number', tableHidden: true },
      carparkLotNo: { label: 'Carpark Lot', tableHidden: true },
      carparkType: { label: 'Carpark Type', tableHidden: true },
      lotTypeId: { label: 'Lot Type', foreignKey: { table: 'lotTypes', labelColumn: 'name' } },
      bookingStatusId: { label: 'Booking Status', foreignKey: { table: 'bookingStatuses', labelColumn: 'name' } },
      basePrice: { label: 'Base Price', fieldType: 'decimal' },
      finalPrice: { label: 'Final Price', fieldType: 'decimal', tableHidden: true },
      assignedLawyerId: { label: 'Assigned Lawyer', foreignKey: { table: 'panelLawyers', labelColumn: 'name' }, tableHidden: true },
    },
  },

  // ───── Sales & Marketing ───────────────────────────────────────────────────
  inventoryItems: {
    key: 'inventoryItems',
    label: 'Inventory Items',
    group: 'sales',
    table: schema.inventoryItems,
    labelColumn: 'name',
    searchColumns: ['name', 'category'],
    defaultSort: { column: 'name', direction: 'asc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      projectId: { label: 'Project', foreignKey: { table: 'projects', labelColumn: 'name' } },
      name: { label: 'Name' },
      category: { label: 'Category' },
      description: { label: 'Description', fieldType: 'textarea', tableHidden: true },
    },
  },
  salesPackages: {
    key: 'salesPackages',
    label: 'Sales Packages',
    group: 'sales',
    table: schema.salesPackages,
    labelColumn: 'name',
    searchColumns: ['name'],
    defaultSort: { column: 'name', direction: 'asc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      projectId: { label: 'Project', foreignKey: { table: 'projects', labelColumn: 'name' } },
      name: { label: 'Name' },
      buyerTypeId: { label: 'Buyer Type', foreignKey: { table: 'buyerTypes', labelColumn: 'name' } },
      rebatePercentage: { label: 'Rebate %', fieldType: 'decimal' },
      cashBackAmount: { label: 'Cash Back', fieldType: 'decimal' },
      validFrom: { label: 'Valid From', fieldType: 'date' },
      validTo: { label: 'Valid To', fieldType: 'date' },
      isActive: { label: 'Active', fieldType: 'boolean' },
    },
  },

  // ───── Referral System ─────────────────────────────────────────────────────
  giftCatalog: {
    key: 'giftCatalog',
    label: 'Gift Catalog',
    group: 'referrals',
    table: schema.giftCatalog,
    labelColumn: 'name',
    searchColumns: ['name'],
    defaultSort: { column: 'name', direction: 'asc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      name: { label: 'Name' },
      description: { label: 'Description', fieldType: 'textarea', tableHidden: true },
      imageUrl: { label: 'Image URL', tableHidden: true },
      estimatedValue: { label: 'Est. Value', fieldType: 'decimal' },
      stockQty: { label: 'Stock', fieldType: 'number' },
      isActive: { label: 'Active', fieldType: 'boolean' },
    },
  },
  voucherCatalog: {
    key: 'voucherCatalog',
    label: 'Voucher Catalog',
    group: 'referrals',
    table: schema.voucherCatalog,
    labelColumn: 'name',
    searchColumns: ['name', 'type'],
    defaultSort: { column: 'name', direction: 'asc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      name: { label: 'Name' },
      type: {
        label: 'Type',
        fieldType: 'select',
        options: [
          { value: 'TNG_TOPUP', label: 'TnG Top-Up' },
          { value: 'TNG_VOUCHER', label: 'TnG Voucher' },
          { value: 'GRAB', label: 'Grab' },
          { value: 'SHOPEE', label: 'Shopee' },
          { value: 'LAZADA', label: 'Lazada' },
          { value: 'OTHER', label: 'Other' },
        ],
      },
      denomination: { label: 'Denomination', fieldType: 'decimal' },
      description: { label: 'Description', fieldType: 'textarea', tableHidden: true },
      imageUrl: { label: 'Image URL', tableHidden: true },
      stockQty: { label: 'Stock', fieldType: 'number' },
      isActive: { label: 'Active', fieldType: 'boolean' },
    },
  },
  rewardConfig: {
    key: 'rewardConfig',
    label: 'Reward Config',
    group: 'referrals',
    table: schema.rewardConfig,
    labelColumn: 'name',
    searchColumns: ['name', 'triggerEvent'],
    defaultSort: { column: 'name', direction: 'asc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      name: { label: 'Name' },
      triggerEvent: {
        label: 'Trigger Event',
        fieldType: 'select',
        options: [
          { value: 'ON_REGISTRATION', label: 'On Registration' },
          { value: 'ON_BOOKING', label: 'On Booking' },
          { value: 'ON_SPA_SIGNED', label: 'On SPA Signed' },
        ],
      },
      rewardType: {
        label: 'Reward Type',
        fieldType: 'select',
        options: [
          { value: 'PHYSICAL_GIFT', label: 'Physical Gift' },
          { value: 'VOUCHER', label: 'Voucher' },
          { value: 'CASH', label: 'Cash' },
        ],
      },
      giftId: { label: 'Gift', foreignKey: { table: 'giftCatalog', labelColumn: 'name' }, tableHidden: true },
      voucherId: { label: 'Voucher', foreignKey: { table: 'voucherCatalog', labelColumn: 'name' }, tableHidden: true },
      cashAmount: { label: 'Cash Amount', fieldType: 'decimal' },
      description: { label: 'Description', fieldType: 'textarea', tableHidden: true },
      isActive: { label: 'Active', fieldType: 'boolean' },
    },
  },
  referralTiers: {
    key: 'referralTiers',
    label: 'Referral Tiers',
    group: 'referrals',
    table: schema.referralTiers,
    labelColumn: 'name',
    searchColumns: ['name'],
    defaultSort: { column: 'minReferrals', direction: 'asc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      name: { label: 'Tier Name' },
      minReferrals: { label: 'Min Referrals', fieldType: 'number' },
      rewardType: {
        label: 'Reward Type',
        fieldType: 'select',
        options: [
          { value: 'PHYSICAL_GIFT', label: 'Physical Gift' },
          { value: 'VOUCHER', label: 'Voucher' },
          { value: 'CASH', label: 'Cash' },
        ],
      },
      giftId: { label: 'Gift', foreignKey: { table: 'giftCatalog', labelColumn: 'name' }, tableHidden: true },
      voucherId: { label: 'Voucher', foreignKey: { table: 'voucherCatalog', labelColumn: 'name' }, tableHidden: true },
      rewardAmount: { label: 'Reward Amount', fieldType: 'decimal' },
      description: { label: 'Description', fieldType: 'textarea', tableHidden: true },
    },
  },
  referralRewards: {
    key: 'referralRewards',
    label: 'Referral Rewards',
    group: 'referrals',
    table: schema.referralRewards,
    labelColumn: 'id',
    searchColumns: ['status', 'triggerEvent'],
    defaultSort: { column: 'createdAt', direction: 'desc' },
    columnOverrides: {
      id: { formHidden: true, readOnly: true },
      referrerId: { label: 'Referrer', foreignKey: { table: 'users', labelColumn: 'name' } },
      refereeId: { label: 'Referee', foreignKey: { table: 'users', labelColumn: 'name' } },
      status: {
        label: 'Status',
        fieldType: 'select',
        options: [
          { value: 'PENDING', label: 'Pending' },
          { value: 'ELIGIBLE', label: 'Eligible' },
          { value: 'FULFILLED', label: 'Fulfilled' },
          { value: 'MANUAL_REVIEW', label: 'Manual Review' },
        ],
      },
      rewardType: {
        label: 'Reward Type',
        fieldType: 'select',
        options: [
          { value: 'PHYSICAL_GIFT', label: 'Physical Gift' },
          { value: 'VOUCHER', label: 'Voucher' },
          { value: 'CASH', label: 'Cash' },
        ],
      },
      amount: { label: 'Amount', fieldType: 'decimal' },
      triggerEvent: { label: 'Trigger', tableHidden: true },
      giftId: { label: 'Gift', foreignKey: { table: 'giftCatalog', labelColumn: 'name' }, tableHidden: true },
      voucherId: { label: 'Voucher', foreignKey: { table: 'voucherCatalog', labelColumn: 'name' }, tableHidden: true },
      rewardConfigId: { label: 'Config', foreignKey: { table: 'rewardConfig', labelColumn: 'name' }, tableHidden: true },
      fulfilledAt: { label: 'Fulfilled At', fieldType: 'datetime', tableHidden: true },
      fulfilledBy: { label: 'Fulfilled By', foreignKey: { table: 'users', labelColumn: 'name' }, tableHidden: true },
      notes: { label: 'Notes', fieldType: 'textarea', tableHidden: true },
      createdAt: { formHidden: true, readOnly: true, label: 'Created' },
      updatedAt: { formHidden: true, readOnly: true, label: 'Updated' },
    },
  },
  redemptions: {
    key: 'redemptions',
    label: 'Redemptions',
    group: 'referrals',
    table: schema.redemptions,
    labelColumn: 'code',
    searchColumns: ['code', 'rewardItem'],
    defaultSort: { column: 'createdAt', direction: 'desc' },
    columnOverrides: {
      id: { formHidden: true, readOnly: true },
      userId: { label: 'User', foreignKey: { table: 'users', labelColumn: 'name' } },
      amount: { label: 'Amount', fieldType: 'decimal' },
      rewardItem: { label: 'Reward Item' },
      status: {
        label: 'Status',
        fieldType: 'select',
        options: [
          { value: 'PENDING', label: 'Pending' },
          { value: 'APPROVED', label: 'Approved' },
          { value: 'REJECTED', label: 'Rejected' },
        ],
      },
      code: { label: 'Code' },
      createdAt: { formHidden: true, readOnly: true, label: 'Created' },
      updatedAt: { formHidden: true, readOnly: true, label: 'Updated' },
    },
  },

  // ───── Users ───────────────────────────────────────────────────────────────
  users: {
    key: 'users',
    label: 'Users',
    group: 'users',
    table: schema.user,
    labelColumn: 'name',
    searchColumns: ['name', 'email', 'phoneNumber'],
    defaultSort: { column: 'createdAt', direction: 'desc' },
    columnOverrides: {
      id: { formHidden: true, readOnly: true },
      name: { label: 'Name' },
      email: { label: 'Email' },
      emailVerified: { label: 'Email Verified', fieldType: 'boolean', tableHidden: true },
      image: { label: 'Avatar URL', tableHidden: true },
      createdAt: { formHidden: true, readOnly: true, label: 'Created' },
      updatedAt: { formHidden: true, readOnly: true, label: 'Updated' },
      phoneNumber: { label: 'Phone' },
      phoneNumberVerified: { label: 'Phone Verified', fieldType: 'boolean', tableHidden: true },
      nationality: { label: 'Nationality', tableHidden: true },
      onboardingCompleted: { label: 'Onboarded', fieldType: 'boolean', tableHidden: true },
      roleId: { label: 'Role', foreignKey: { table: 'roles', labelColumn: 'name' } },
      renNumber: { label: 'REN Number', tableHidden: true },
      agencyName: { label: 'Agency', tableHidden: true },
      referralCode: { label: 'Referral Code' },
      referredByUserId: { label: 'Referred By', foreignKey: { table: 'users', labelColumn: 'name' }, tableHidden: true },
    },
  },

  // ───── Operations ──────────────────────────────────────────────────────────
  appointments: {
    key: 'appointments',
    label: 'Appointments',
    group: 'operations',
    table: schema.appointments,
    labelColumn: 'id',
    searchColumns: ['notes'],
    defaultSort: { column: 'scheduledAt', direction: 'desc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      userId: { label: 'Customer', foreignKey: { table: 'users', labelColumn: 'name' } },
      agentId: { label: 'Agent', foreignKey: { table: 'users', labelColumn: 'name' } },
      projectId: { label: 'Project', foreignKey: { table: 'projects', labelColumn: 'name' } },
      scheduledAt: { label: 'Scheduled At', fieldType: 'datetime' },
      statusId: { label: 'Status', foreignKey: { table: 'appointmentStatuses', labelColumn: 'name' } },
      notes: { label: 'Notes', fieldType: 'textarea', tableHidden: true },
      qrToken: { label: 'QR Token', tableHidden: true },
      scannedAt: { label: 'Scanned At', fieldType: 'datetime', tableHidden: true },
      scannedById: { label: 'Scanned By', foreignKey: { table: 'users', labelColumn: 'name' }, tableHidden: true },
      referrerId: { label: 'Referrer', foreignKey: { table: 'users', labelColumn: 'name' }, tableHidden: true },
    },
  },

  // ───── Files ───────────────────────────────────────────────────────────────
  files: {
    key: 'files',
    label: 'Files',
    group: 'system',
    table: schema.files,
    labelColumn: 'url',
    searchColumns: ['key', 'url', 'mimeType'],
    defaultSort: { column: 'createdAt', direction: 'desc' },
    columnOverrides: {
      ...BASE_COL_OVERRIDES,
      provider: { label: 'Provider' },
      key: { label: 'Key' },
      url: { label: 'URL' },
      mimeType: { label: 'MIME Type' },
      size: { label: 'Size (bytes)', fieldType: 'number' },
    },
  },

  // ───── Junction Tables ─────────────────────────────────────────────────────
  projectAmenities: {
    key: 'projectAmenities',
    label: 'Project Amenities',
    group: 'junctions',
    table: schema.projectAmenities,
    compositePK: ['projectId', 'amenityId'],
    searchColumns: [],
    columnOverrides: {
      projectId: { label: 'Project', foreignKey: { table: 'projects', labelColumn: 'name' } },
      amenityId: { label: 'Amenity', foreignKey: { table: 'amenities', labelColumn: 'name' } },
    },
  },
  projectTags: {
    key: 'projectTags',
    label: 'Project Tags',
    group: 'junctions',
    table: schema.projectTags,
    compositePK: ['projectId', 'tagId'],
    searchColumns: [],
    columnOverrides: {
      projectId: { label: 'Project', foreignKey: { table: 'projects', labelColumn: 'name' } },
      tagId: { label: 'Tag', foreignKey: { table: 'tags', labelColumn: 'name' } },
    },
  },
  projectBankers: {
    key: 'projectBankers',
    label: 'Project Bankers',
    group: 'junctions',
    table: schema.projectBankers,
    compositePK: ['projectId', 'bankerId'],
    searchColumns: [],
    columnOverrides: {
      projectId: { label: 'Project', foreignKey: { table: 'projects', labelColumn: 'name' } },
      bankerId: { label: 'Banker', foreignKey: { table: 'panelBankers', labelColumn: 'bankerName' } },
    },
  },
  packageInventory: {
    key: 'packageInventory',
    label: 'Package Inventory',
    group: 'junctions',
    table: schema.packageInventory,
    compositePK: ['packageId', 'inventoryItemId'],
    searchColumns: [],
    columnOverrides: {
      packageId: { label: 'Package', foreignKey: { table: 'salesPackages', labelColumn: 'name' } },
      inventoryItemId: { label: 'Inventory Item', foreignKey: { table: 'inventoryItems', labelColumn: 'name' } },
      quantity: { label: 'Quantity', fieldType: 'number' },
    },
  },
};

// ── Group definitions for sidebar navigation ─────────────────────────────────

export type TableGroup = {
  key: string;
  label: string;
  tables: string[]; // keys in TABLE_REGISTRY
};

export const TABLE_GROUPS: TableGroup[] = [
  {
    key: 'lookups',
    label: 'Lookups',
    tables: [
      'propertyCategories', 'propertyTypes', 'tenureTypes', 'titleTypes', 'lotTypes',
      'unitPositions', 'projectStatuses', 'constructionStatuses', 'bookingStatuses',
      'appointmentStatuses', 'financingTypes', 'buyerTypes', 'promotionTypes',
      'amenities', 'tags', 'mediaTypes', 'roles',
    ],
  },
  {
    key: 'locations',
    label: 'Locations',
    tables: ['states', 'regions', 'areas'],
  },
  {
    key: 'panels',
    label: 'Professional Panels',
    tables: ['panelLawyers', 'panelBankers'],
  },
  {
    key: 'projects',
    label: 'Projects',
    tables: ['developers', 'projects', 'projectPhases', 'projectTowers', 'towerFacingGroups', 'towerStacks', 'towerSpecialFloors', 'projectLayouts'],
  },
  {
    key: 'units',
    label: 'Units',
    tables: ['units'],
  },
  {
    key: 'sales',
    label: 'Sales & Marketing',
    tables: ['inventoryItems', 'salesPackages'],
  },
  {
    key: 'referrals',
    label: 'Referrals',
    tables: ['giftCatalog', 'voucherCatalog', 'rewardConfig', 'referralTiers', 'referralRewards', 'redemptions'],
  },
  {
    key: 'users',
    label: 'Users',
    tables: ['users'],
  },
  {
    key: 'operations',
    label: 'Operations',
    tables: ['appointments'],
  },
  {
    key: 'system',
    label: 'System',
    tables: ['files'],
  },
  {
    key: 'junctions',
    label: 'Junction Tables',
    tables: ['projectAmenities', 'projectTags', 'projectBankers', 'packageInventory'],
  },
];
