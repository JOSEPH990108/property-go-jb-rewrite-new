import { describe, expect, it } from "vitest";

import { BulkDeveloperSchema } from "@/lib/bulk-import-schema";

describe("BulkDeveloperSchema", () => {
  it("accepts developer CSV rows with snake_case-compatible values", () => {
    const result = BulkDeveloperSchema.safeParse({
      slug: "alam-heights",
      name: "Alam Heights Sdn. Bhd.",
      legalName: "Alam Heights Sdn. Bhd. (1180698A/201601009770)",
      isActive: "true",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.action).toBe("create");
      expect(result.data.isActive).toBe(true);
    }
  });

  it("rejects invalid developer active values", () => {
    const result = BulkDeveloperSchema.safeParse({
      slug: "alam-heights",
      name: "Alam Heights Sdn. Bhd.",
      isActive: "enabled",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path.join(".")).toBe("isActive");
    }
  });
});
