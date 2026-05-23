// src\components\admin\BulkImportDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, CheckCircle, AlertTriangle, Download } from "lucide-react";
import { BulkImportEntityType, BulkImportResult } from "@/lib/bulk-import-schema";
import { BULK_IMPORT_ENTITY_CONFIG, BULK_IMPORT_ENTITY_ORDER } from "@/lib/bulk-import-config";
import { useBulkImportDialog } from "@/hooks/useBulkImportDialog";

export function BulkImportDialog() {
  const {
    open,
    entityType,
    setEntityType,
    file,
    loading,
    result,
    error,
    prepProjectSlug,
    setPrepProjectSlug,
    prepTowerNumber,
    setPrepTowerNumber,
    prepPhaseName,
    setPrepPhaseName,
    prepUnavailableStatusCode,
    setPrepUnavailableStatusCode,
    fileInputRef,
    selectedConfig,
    canPrepareAvailability,
    handleFileSelect,
    handleImport,
    handlePrepareAvailability,
    downloadTemplate,
    handleDialogClose,
  } = useBulkImportDialog();

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Catalog Data</DialogTitle>
          <DialogDescription>
            Import developers, projects, and related inventory records from CSV files.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            {/* Entity Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Entity Type</label>
              <Select
                value={entityType || undefined}
                onValueChange={(value) => setEntityType(value as BulkImportEntityType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select what to import..." />
                </SelectTrigger>
                <SelectContent className="max-h-96 w-[var(--radix-select-trigger-width)]">
                  {BULK_IMPORT_ENTITY_ORDER.map((type) => {
                    const config = BULK_IMPORT_ENTITY_CONFIG[type];
                    if (!config) return null;

                    return (
                      <SelectItem key={type} value={type}>
                        {config.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedConfig && (
                <p className="text-muted-foreground text-sm">{selectedConfig.description}</p>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {canPrepareAvailability ? "CSV File or Raw Availability Export" : "CSV File"}
              </label>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(event) => handleFileSelect(event.target.files?.[0])}
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  disabled={!entityType}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Template
                </Button>
              </div>
              {file && (
                <p className="text-sm text-green-600">
                  ✓ {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                Recommended import order: Developers, Projects, Phases/Towers/Layouts, then Units.
              </p>
            </div>

            {canPrepareAvailability && (
              <div className="border-border bg-muted/20 space-y-3 rounded-lg border p-4">
                <div>
                  <h4 className="text-sm font-medium">Prepare from availability sheet</h4>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Use the same dialog to convert a raw sales availability CSV into import-ready
                    unit CSVs.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-muted-foreground text-xs font-medium">
                      Project Slug
                    </label>
                    <Input
                      value={prepProjectSlug}
                      onChange={(event) => setPrepProjectSlug(event.target.value)}
                      placeholder="paragon-signature-suites"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted-foreground text-xs font-medium">
                      Tower Number
                    </label>
                    <Input
                      value={prepTowerNumber}
                      onChange={(event) => setPrepTowerNumber(event.target.value)}
                      placeholder="TOWER-1"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted-foreground text-xs font-medium">Phase Name</label>
                    <Input
                      value={prepPhaseName}
                      onChange={(event) => setPrepPhaseName(event.target.value)}
                      placeholder="Phase 1"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted-foreground text-xs font-medium">
                      Unavailable Status Code
                    </label>
                    <Input
                      value={prepUnavailableStatusCode}
                      onChange={(event) =>
                        setPrepUnavailableStatusCode(event.target.value.toUpperCase())
                      }
                      placeholder="RESERVED"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="border-border bg-background/60 text-muted-foreground rounded-md border border-dashed p-3 text-xs">
                  This creates four downloads: `units.csv`, `layout-summary.csv`,
                  `availability-audit.csv`, and `summary.json`. The `units.csv` output can then be
                  imported with this same dialog.
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleDialogClose(false)} disabled={loading}>
                Cancel
              </Button>
              {canPrepareAvailability && (
                <Button
                  variant="outline"
                  onClick={handlePrepareAvailability}
                  disabled={!file || loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Prepare CSV Pack
                </Button>
              )}
              <Button onClick={handleImport} disabled={!file || !entityType || loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Importing..." : "Import"}
              </Button>
            </div>
          </div>
        ) : (
          <BulkImportResults result={result} onClose={() => handleDialogClose(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// RESULTS COMPONENT
// ============================================

interface BulkImportResultsProps {
  result: BulkImportResult;
  onClose: () => void;
}

function BulkImportResults({ result, onClose }: BulkImportResultsProps) {
  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold">{result.totalRows}</div>
        </div>
        <div className="rounded-lg bg-green-50 p-3">
          <div className="text-sm text-gray-600">Success</div>
          <div className="text-2xl font-bold text-green-600">{result.successCount}</div>
        </div>
        <div className="rounded-lg bg-red-50 p-3">
          <div className="text-sm text-gray-600">Failed</div>
          <div className="text-2xl font-bold text-red-600">{result.failureCount}</div>
        </div>
      </div>

      {/* Status Alert */}
      {result.success ? (
        <div className="flex gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
          <div className="text-sm text-green-700">
            Import completed successfully! All {result.successCount} records were imported.
          </div>
        </div>
      ) : (
        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
          <div className="text-sm text-red-700">
            Import completed with {result.failureCount} error(s). Please review the details below.
          </div>
        </div>
      )}

      {/* Errors and Warnings */}
      <div className="space-y-3">
        {result.errors.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-red-600">Errors</h4>
            <ScrollArea className="h-40">
              <div className="space-y-1 pr-4">
                {result.errors.map((err, idx) => (
                  <div key={idx} className="rounded border border-red-200 bg-red-50 p-2 text-xs">
                    <div className="font-medium">Row {err.rowNumber}</div>
                    {err.field && <div className="text-gray-600">{err.field}:</div>}
                    <div className="text-red-700">{err.message}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {result.warnings.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-yellow-600">Warnings</h4>
            <ScrollArea className="h-40">
              <div className="space-y-1 pr-4">
                {result.warnings.map((warn, idx) => (
                  <div
                    key={idx}
                    className="rounded border border-yellow-200 bg-yellow-50 p-2 text-xs"
                  >
                    <div className="font-medium">Row {warn.rowNumber}</div>
                    <div className="text-yellow-700">{warn.message}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Duration */}
      <div className="text-center text-xs text-gray-500">
        Completed in {(result.duration / 1000).toFixed(2)}s
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
