import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { prepareAvailabilityImportArtifacts } from "../src/lib/bulk-import-availability-prep";

type CliOptions = {
  input?: string;
  outputDir?: string;
  projectSlug?: string;
  towerNumber?: string;
  phaseName?: string;
  unavailableStatusCode?: string;
};

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    switch (arg) {
      case "--input":
        options.input = next;
        index += 1;
        break;
      case "--outputDir":
        options.outputDir = next;
        index += 1;
        break;
      case "--projectSlug":
        options.projectSlug = next;
        index += 1;
        break;
      case "--towerNumber":
        options.towerNumber = next;
        index += 1;
        break;
      case "--phaseName":
        options.phaseName = next;
        index += 1;
        break;
      case "--unavailableStatusCode":
        options.unavailableStatusCode = next;
        index += 1;
        break;
      default:
        break;
    }
  }

  return options;
}

function printUsage(): void {
  console.log(
    [
      "Usage:",
      "  npm run bulk:prepare:availability -- --input <raw.csv> --projectSlug <slug> [--outputDir <dir>] [--towerNumber <tower>] [--phaseName <phase>] [--unavailableStatusCode <code>]",
      "",
      "Example:",
      '  npm run bulk:prepare:availability -- --input "samples/raw/paragon.csv" --projectSlug paragon-signature-suites --towerNumber TOWER-1 --outputDir "samples/bulk-import/paragon-signature-suite/generated"',
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (!options.input || !options.projectSlug) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const inputPath = path.resolve(options.input);
  const outputDir = path.resolve(
    options.outputDir ?? path.join("samples", "bulk-import", options.projectSlug),
  );
  const csvContent = await readFile(inputPath, "utf8");

  const artifacts = prepareAvailabilityImportArtifacts(csvContent, {
    projectSlug: options.projectSlug,
    towerNumber: options.towerNumber,
    phaseName: options.phaseName,
    unavailableStatusCode: options.unavailableStatusCode,
  });

  await mkdir(outputDir, { recursive: true });

  await Promise.all([
    writeFile(path.join(outputDir, "units.csv"), artifacts.unitsCsv, "utf8"),
    writeFile(path.join(outputDir, "layout-summary.csv"), artifacts.layoutSummaryCsv, "utf8"),
    writeFile(path.join(outputDir, "availability-audit.csv"), artifacts.auditCsv, "utf8"),
    writeFile(
      path.join(outputDir, "prep-summary.json"),
      JSON.stringify(artifacts.summary, null, 2),
      "utf8",
    ),
  ]);

  console.log(`Prepared ${artifacts.summary.preparedUnits} unit rows for ${options.projectSlug}.`);
  console.log(`Available: ${artifacts.summary.availableCount}`);
  console.log(`Unavailable: ${artifacts.summary.unavailableCount}`);
  console.log(`Unique layouts: ${artifacts.summary.uniqueLayouts}`);
  console.log(`Output: ${outputDir}`);
}

void main();
