"use client";

import { useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { BulkImportEntityType, BulkImportResult } from "@/lib/bulk-import-schema";
import { BULK_IMPORT_ENTITY_CONFIG } from "@/lib/bulk-import-config";
import { prepareAvailabilityImportArtifacts } from "@/lib/bulk-import-availability-prep";
import { useGlobalLoaderStore } from "@/stores/global-loader-store";

const CSV_MIME_TYPES = new Set([
  "",
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "text/plain",
]);

const importSelectionSchema = z.object({
  entityType: z.nativeEnum(BulkImportEntityType),
  file: z.instanceof(File),
});

const availabilityPrepSchema = z.object({
  file: z.instanceof(File),
  projectSlug: z.string().min(1, "Project slug is required"),
  towerNumber: z.string().optional(),
  phaseName: z.string().optional(),
  unavailableStatusCode: z.string().min(1, "Unavailable status code is required"),
});

function isCsvFile(file: File): boolean {
  return file.name.toLowerCase().endsWith(".csv") || CSV_MIME_TYPES.has(file.type);
}

export function useBulkImportDialog() {
  const [open, setOpen] = useState(false);
  const [entityType, setEntityType] = useState<BulkImportEntityType | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prepProjectSlug, setPrepProjectSlug] = useState("");
  const [prepTowerNumber, setPrepTowerNumber] = useState("");
  const [prepPhaseName, setPrepPhaseName] = useState("");
  const [prepUnavailableStatusCode, setPrepUnavailableStatusCode] = useState("RESERVED");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { show, hide, update } = useGlobalLoaderStore();

  const selectedConfig = entityType ? BULK_IMPORT_ENTITY_CONFIG[entityType] : null;
  const canPrepareAvailability = entityType === BulkImportEntityType.UNIT;

  const handleFileSelect = (selectedFile: File | null | undefined) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!isCsvFile(selectedFile)) {
      setError("Please select a valid CSV file");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const resetForm = () => {
    setFile(null);
    setEntityType("");
    setResult(null);
    setError(null);
    setPrepProjectSlug("");
    setPrepTowerNumber("");
    setPrepPhaseName("");
    setPrepUnavailableStatusCode("RESERVED");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDialogClose = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  };

  const handleImport = async () => {
    const parsed = importSelectionSchema.safeParse({ entityType, file });
    if (!parsed.success) {
      setError("Please select a file and entity type");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    show("Compiling Import...", "Reading and validating your CSV file.");

    try {
      const csvContent = await parsed.data.file.text();
      update("Importing Records...", "Applying validated rows to the database.");
      const importResult =
        await BULK_IMPORT_ENTITY_CONFIG[parsed.data.entityType].action(csvContent);
      setResult(importResult);

      if (importResult.success) {
        toast.success(`Imported ${importResult.successCount} records successfully`);
      } else {
        toast.error(`Import completed with ${importResult.failureCount} error(s)`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Import failed";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      hide();
      setLoading(false);
    }
  };

  const downloadFile = (fileName: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrepareAvailability = async () => {
    const parsed = availabilityPrepSchema.safeParse({
      file,
      projectSlug: prepProjectSlug.trim(),
      towerNumber: prepTowerNumber.trim() || undefined,
      phaseName: prepPhaseName.trim() || undefined,
      unavailableStatusCode: prepUnavailableStatusCode.trim(),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please complete the preparation fields");
      return;
    }

    setLoading(true);
    setError(null);
    show("Preparing CSV Pack...", "Transforming raw availability sheet into import-ready files.");

    try {
      const csvContent = await parsed.data.file.text();
      update("Building Artifacts...", "Generating units CSV, layout summary, and audit outputs.");

      const artifacts = prepareAvailabilityImportArtifacts(csvContent, {
        projectSlug: parsed.data.projectSlug,
        towerNumber: parsed.data.towerNumber,
        phaseName: parsed.data.phaseName,
        unavailableStatusCode: parsed.data.unavailableStatusCode,
      });

      const baseName = `${parsed.data.projectSlug}-availability`;
      downloadFile(`${baseName}-units.csv`, artifacts.unitsCsv, "text/csv");
      downloadFile(`${baseName}-layout-summary.csv`, artifacts.layoutSummaryCsv, "text/csv");
      downloadFile(`${baseName}-audit.csv`, artifacts.auditCsv, "text/csv");
      downloadFile(
        `${baseName}-summary.json`,
        JSON.stringify(artifacts.summary, null, 2),
        "application/json",
      );

      toast.success(`Prepared ${artifacts.summary.preparedUnits} unit rows for import`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Preparation failed";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      hide();
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    if (!entityType) {
      setError("Please select an entity type first");
      return;
    }

    const config = BULK_IMPORT_ENTITY_CONFIG[entityType];
    const csvHeader = config.templateCsvHeaders.join(",");
    const csvContent = [csvHeader, config.templateSampleRow.join(",")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `bulk-import-${entityType}-template.csv`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    open,
    setOpen,
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
  };
}
