import { test, expect } from "@playwright/test";

test("homepage loads and has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/PropertyGoJB/);
});

test("property listing page is accessible", async ({ page }) => {
  await page.goto("/properties");
  await expect(page.locator("body")).toBeVisible();
});
