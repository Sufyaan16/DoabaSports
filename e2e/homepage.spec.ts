import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("renders hero section with brand name", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Doaba Sports");
  });

  test("has Shop Now link pointing to products", async ({ page }) => {
    const shopNow = page.getByRole("link", { name: "Shop Now", exact: true });
    await expect(shopNow).toBeVisible();
    await expect(shopNow).toHaveAttribute("href", "/products");
  });

  test("has View Collection link pointing to categories", async ({ page }) => {
    const viewCollection = page.getByRole("link", {
      name: /view collection/i,
    });
    await expect(viewCollection).toBeVisible();
    await expect(viewCollection).toHaveAttribute("href", "/categories");
  });

  test("renders features section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "COD SHIPPING" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "CUSTOMER SUPPORT" })).toBeVisible();
  });

  test("renders footer with contact email", async ({ page }) => {
    await expect(page.getByText("doabasports@gmail.com")).toBeVisible();
  });
});
