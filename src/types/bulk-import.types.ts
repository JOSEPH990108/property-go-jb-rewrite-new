import { BulkImportEntityType, BulkImportResult } from '@/lib/bulk-import-schema';

export type BulkImportEntityConfig = {
  label: string;
  description: string;
  templateCsvHeaders: string[];
  templateSampleRow: string[];
  action: (csvContent: string) => Promise<BulkImportResult>;
};

export type BulkImportTemplateConfigMap = Record<BulkImportEntityType, BulkImportEntityConfig>;

export type ParsedCsvRow = Record<string, string | number> & {
  _rowNumber: number;
};

export type ValidatedBulkRow<TData> = TData & {
  _rowNumber: number;
};
