import { describe, expect, it } from "vitest";

import { prepareAvailabilityImportArtifacts } from "@/lib/bulk-import-availability-prep";

describe("prepareAvailabilityImportArtifacts", () => {
  it("converts a raw availability sheet into unit import csv and audit artifacts", () => {
    const csv = [
      "No,Unit,Type,Sq Ft,Bumi Unit,Unit Sales Status Desc,Unit Selling Price,Nett Price,Agent,Booking Date,Booking Fee,BANK",
      '1,A-11-18,Type A,646,No,Available,"581,400.00","455,817.60",CHEE HOE,2026-04-09,RM 200.00,',
      '2,A-11-22,Type A,646,No,Not Available,"581,400.00","455,817.60",Jramin NEG1696,2025-12-13,RM 200.00,MBB',
      '3,A-13-20,Type B,649,No,Not Available,"631,285.00","494,927.44",Wei Siang AVP 1007,2025-11-10,RM 200.00,AMB',
    ].join("\n");

    const artifacts = prepareAvailabilityImportArtifacts(csv, {
      projectSlug: "paragon-signature-suites",
      towerNumber: "TOWER-1",
    });

    expect(artifacts.summary).toEqual({
      totalRows: 3,
      preparedUnits: 3,
      uniqueLayouts: 2,
      availableCount: 1,
      unavailableCount: 2,
    });

    expect(artifacts.unitsCsv).toContain(
      "create,paragon-signature-suites,TYPE_A,TOWER-1,,A-11-18,11,18,1,646.00",
    );
    expect(artifacts.unitsCsv).toContain("NON_BUMIPUTERA,AVAILABLE,581400.00,455817.60");
    expect(artifacts.unitsCsv).toContain("TYPE_B,TOWER-1,,A-13-20,13,20,3,649.00");
    expect(artifacts.unitsCsv).toContain("NON_BUMIPUTERA,RESERVED,631285.00,494927.44");

    expect(artifacts.layoutSummaryCsv).toContain("TYPE_A,Type A,646.00,2");
    expect(artifacts.layoutSummaryCsv).toContain("TYPE_B,Type B,649.00,1");

    expect(artifacts.auditCsv).toContain(
      "A-11-22,Not Available,RESERVED,Jramin NEG1696,2025-12-13,200.00,MBB",
    );
  });

  it("maps sold-like statuses to SOLD and bumi units to BUMIPUTERA", () => {
    const csv = [
      "Unit,Type,Sq Ft,Bumi Unit,Unit Sales Status Desc,Unit Selling Price,Nett Price",
      'A-29-22,Type A,646,Yes,Signed SPA,"599,400.00","469,929.60"',
    ].join("\n");

    const artifacts = prepareAvailabilityImportArtifacts(csv, {
      projectSlug: "paragon-signature-suites",
    });

    expect(artifacts.unitsCsv).toContain("BUMIPUTERA,SOLD,599400.00,469929.60");
  });
});
