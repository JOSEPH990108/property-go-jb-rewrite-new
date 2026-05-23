import { describe, expect, it } from "vitest";

import { BulkProjectSchema } from "@/lib/bulk-import-schema";

describe("BulkProjectSchema", () => {
  it("accepts a correctly aligned project row", () => {
    const result = BulkProjectSchema.safeParse({
      action: "create",
      slug: "alam-heights-red-hill",
      name: "Alam Heights (Red Hill)",
      displayName: "Alam Heights (Red Hill)",
      legalName: "",
      description: "Double Storey Terrace House",
      developerSlug: "alam-heights",
      propertyCategoryCode: "LANDED",
      propertyTypeCode: "TERRACE",
      projectStatusCode: "UNDER_CONSTRUCTION",
      tenureTypeCode: "FREEHOLD",
      titleTypeCode: "",
      stateName: "Johor",
      regionName: "Pasir Gudang Corridor",
      areaName: "Bandar Seri Alam",
      address: "47, Jalan Tasek 44, Bandar Baru Seri Alam, 81750 Masai, Johor Darul Ta'zim",
      latitude: "",
      longitude: "",
      totalUnits: "113",
      launchYear: "2026",
      bookingFee: "2000",
      maintenanceFeePerSqft: "",
      isPublished: "yes",
      isForeignerEligible: "no",
      tenureExpiryDate: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects shifted project rows with clear field errors", () => {
    const result = BulkProjectSchema.safeParse({
      action: "create",
      slug: "alam-heights-red-hill",
      name: "Alam Heights (Red Hill)",
      displayName: "Alam Heights (Red Hill)",
      legalName: "",
      description: "Double Storey Terrace House",
      developerSlug: "alam-heights",
      propertyCategoryCode: "LANDED",
      propertyTypeCode: "TERRACE",
      projectStatusCode: "UNDER_CONSTRUCTION",
      tenureTypeCode: "FREEHOLD",
      titleTypeCode: "",
      stateName: "",
      regionName: "Johor",
      areaName: "Pasir Gudang Corridor",
      address: "Bandar Seri Alam",
      latitude: "47, Jalan Tasek 44, Bandar Baru Seri Alam, 81750 Masai, Johor Darul Ta'zim",
      longitude: "",
      totalUnits: "",
      launchYear: "113",
      bookingFee: "2026",
      maintenanceFeePerSqft: "2000",
      isPublished: "",
      isForeignerEligible: "yes",
      tenureExpiryDate: "no",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path.join("."));
      expect(fields).toContain("latitude");
      expect(fields).toContain("launchYear");
      expect(fields).toContain("tenureExpiryDate");
    }
  });
});
