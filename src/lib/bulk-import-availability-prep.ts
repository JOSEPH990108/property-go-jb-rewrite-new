import { parseCSV } from '@/lib/bulk-import-utils';

const RAW_HEADER_ALIASES: Record<string, string> = {
  no: 'no',
  unit: 'unitNo',
  type: 'typeLabel',
  sqft: 'sqFt',
  bumiunit: 'bumiUnit',
  unitsalesstatusdesc: 'salesStatusDesc',
  unitsellingprice: 'unitSellingPrice',
  nettprice: 'nettPrice',
  agent: 'agentName',
  bookingdate: 'bookingDate',
  bookingfee: 'bookingFee',
  bank: 'bank',
};

const UNIT_HEADERS = [
  'action',
  'projectSlug',
  'layoutCode',
  'towerNumber',
  'phaseName',
  'unitNo',
  'floor',
  'stack',
  'displaySequence',
  'builtUpSqft',
  'landAreaSqft',
  'dimensionText',
  'facing',
  'positionType',
  'carparkCount',
  'carparkLotNo',
  'carparkType',
  'lotTypeCode',
  'bookingStatusCode',
  'basePrice',
  'finalPrice',
] as const;

const LAYOUT_SUMMARY_HEADERS = ['layoutCode', 'typeLabel', 'builtUpSqft', 'unitCount'] as const;
const AUDIT_HEADERS = [
  'sourceRowNumber',
  'unitNo',
  'salesStatusDesc',
  'bookingStatusCode',
  'agentName',
  'bookingDate',
  'bookingFee',
  'bank',
] as const;

export interface AvailabilityPrepOptions {
  projectSlug: string;
  towerNumber?: string;
  phaseName?: string;
  defaultCarparkCount?: number;
  unavailableStatusCode?: string;
}

type RawAvailabilityRow = {
  sourceRowNumber: number;
  unitNo: string;
  typeLabel: string;
  sqFt: string;
  bumiUnit: string;
  salesStatusDesc: string;
  unitSellingPrice: string;
  nettPrice: string;
  agentName: string;
  bookingDate: string;
  bookingFee: string;
  bank: string;
};

export interface PreparedAvailabilityArtifacts {
  unitsCsv: string;
  layoutSummaryCsv: string;
  auditCsv: string;
  summary: {
    totalRows: number;
    preparedUnits: number;
    uniqueLayouts: number;
    availableCount: number;
    unavailableCount: number;
  };
}

function normalizeHeaderKey(header: string): string {
  return header.replace(/^\uFEFF/, '').trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function normalizeDecimal(value: string): string {
  const cleaned = value.replace(/rm/gi, '').replace(/,/g, '').trim();
  if (!cleaned) return '';

  const parsed = Number(cleaned);
  if (Number.isNaN(parsed)) return '';
  return parsed.toFixed(2);
}

function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function rowsToCsv(headers: readonly string[], rows: string[][]): string {
  const output = [headers.join(',')];
  for (const row of rows) {
    output.push(row.map((value) => escapeCsvValue(value ?? '')).join(','));
  }
  return output.join('\n');
}

function mapRawHeaders(headers: string[]): Map<string, number> {
  const indexMap = new Map<string, number>();

  headers.forEach((header, index) => {
    const normalized = RAW_HEADER_ALIASES[normalizeHeaderKey(header)];
    if (normalized && !indexMap.has(normalized)) {
      indexMap.set(normalized, index);
    }
  });

  return indexMap;
}

function getCell(row: string[], indexMap: Map<string, number>, key: string): string {
  const index = indexMap.get(key);
  return index === undefined ? '' : (row[index] ?? '').trim();
}

function toLayoutCode(typeLabel: string): string {
  return typeLabel
    .trim()
    .replace(/^type\s+/i, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()
    .replace(/^/, 'TYPE_');
}

function deriveFloorAndStack(unitNo: string): { floor: string; stack: string } {
  const segments = unitNo.split('-').map((segment) => segment.trim()).filter(Boolean);
  if (segments.length < 3) {
    return { floor: '', stack: '' };
  }

  return {
    floor: segments[segments.length - 2] ?? '',
    stack: segments[segments.length - 1] ?? '',
  };
}

function deriveTowerNumber(unitNo: string, fallback?: string): string {
  if (fallback) return fallback;

  const prefix = unitNo.split('-')[0]?.trim();
  return prefix ? `TOWER-${prefix.toUpperCase()}` : '';
}

function mapLotTypeCode(bumiUnit: string): string {
  return /^yes$/i.test(bumiUnit.trim()) ? 'BUMIPUTERA' : 'NON_BUMIPUTERA';
}

function mapBookingStatusCode(salesStatusDesc: string, unavailableStatusCode: string): string {
  const normalized = salesStatusDesc.trim().toLowerCase();

  if (!normalized || normalized === 'available') return 'AVAILABLE';
  if (normalized === 'sold' || normalized === 'signed spa') return 'SOLD';
  if (normalized === 'cancelled') return 'CANCELLED';
  return unavailableStatusCode;
}

function compareUnits(a: RawAvailabilityRow, b: RawAvailabilityRow): number {
  return a.unitNo.localeCompare(b.unitNo, undefined, { numeric: true, sensitivity: 'base' });
}

function parseRawAvailabilityRows(csvContent: string): RawAvailabilityRow[] {
  const rows = parseCSV(csvContent);
  if (rows.length <= 1) return [];

  const indexMap = mapRawHeaders(rows[0] ?? []);
  const parsedRows: RawAvailabilityRow[] = [];

  rows.slice(1).forEach((row, rowIndex) => {
    const unitNo = getCell(row, indexMap, 'unitNo');
    if (!unitNo) return;

    parsedRows.push({
      sourceRowNumber: rowIndex + 2,
      unitNo,
      typeLabel: getCell(row, indexMap, 'typeLabel'),
      sqFt: getCell(row, indexMap, 'sqFt'),
      bumiUnit: getCell(row, indexMap, 'bumiUnit'),
      salesStatusDesc: getCell(row, indexMap, 'salesStatusDesc'),
      unitSellingPrice: getCell(row, indexMap, 'unitSellingPrice'),
      nettPrice: getCell(row, indexMap, 'nettPrice'),
      agentName: getCell(row, indexMap, 'agentName'),
      bookingDate: getCell(row, indexMap, 'bookingDate'),
      bookingFee: getCell(row, indexMap, 'bookingFee'),
      bank: getCell(row, indexMap, 'bank'),
    });
  });

  parsedRows.sort(compareUnits);
  return parsedRows;
}

export function prepareAvailabilityImportArtifacts(
  csvContent: string,
  options: AvailabilityPrepOptions
): PreparedAvailabilityArtifacts {
  const unavailableStatusCode = options.unavailableStatusCode ?? 'RESERVED';
  const defaultCarparkCount = options.defaultCarparkCount ?? 1;
  const rawRows = parseRawAvailabilityRows(csvContent);

  const unitsRows: string[][] = [];
  const auditRows: string[][] = [];
  const layoutSummaryMap = new Map<string, { layoutCode: string; typeLabel: string; builtUpSqft: string; unitCount: number }>();
  let availableCount = 0;
  let unavailableCount = 0;

  rawRows.forEach((row, index) => {
    const { floor, stack } = deriveFloorAndStack(row.unitNo);
    const layoutCode = toLayoutCode(row.typeLabel || 'UNKNOWN');
    const builtUpSqft = normalizeDecimal(row.sqFt);
    const bookingStatusCode = mapBookingStatusCode(row.salesStatusDesc, unavailableStatusCode);

    if (bookingStatusCode === 'AVAILABLE') {
      availableCount++;
    } else {
      unavailableCount++;
    }

    unitsRows.push([
      'create',
      options.projectSlug,
      layoutCode,
      deriveTowerNumber(row.unitNo, options.towerNumber),
      options.phaseName ?? '',
      row.unitNo,
      floor,
      stack,
      String(index + 1),
      builtUpSqft,
      '',
      '',
      '',
      '',
      String(defaultCarparkCount),
      '',
      '',
      mapLotTypeCode(row.bumiUnit),
      bookingStatusCode,
      normalizeDecimal(row.unitSellingPrice),
      normalizeDecimal(row.nettPrice),
    ]);

    auditRows.push([
      String(row.sourceRowNumber),
      row.unitNo,
      row.salesStatusDesc,
      bookingStatusCode,
      row.agentName,
      row.bookingDate,
      normalizeDecimal(row.bookingFee),
      row.bank,
    ]);

    const layoutKey = `${layoutCode}|${builtUpSqft}`;
    const existingLayout = layoutSummaryMap.get(layoutKey);
    if (existingLayout) {
      existingLayout.unitCount += 1;
    } else {
      layoutSummaryMap.set(layoutKey, {
        layoutCode,
        typeLabel: row.typeLabel,
        builtUpSqft,
        unitCount: 1,
      });
    }
  });

  const layoutSummaryRows = [...layoutSummaryMap.values()]
    .sort((a, b) => a.layoutCode.localeCompare(b.layoutCode, undefined, { numeric: true }))
    .map((layout) => [layout.layoutCode, layout.typeLabel, layout.builtUpSqft, String(layout.unitCount)]);

  return {
    unitsCsv: rowsToCsv(UNIT_HEADERS, unitsRows),
    layoutSummaryCsv: rowsToCsv(LAYOUT_SUMMARY_HEADERS, layoutSummaryRows),
    auditCsv: rowsToCsv(AUDIT_HEADERS, auditRows),
    summary: {
      totalRows: rawRows.length,
      preparedUnits: unitsRows.length,
      uniqueLayouts: layoutSummaryRows.length,
      availableCount,
      unavailableCount,
    },
  };
}