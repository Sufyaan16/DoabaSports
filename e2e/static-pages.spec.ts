import { test, expect } from "@playwright/test";

test.describe("Categories Page", () => {
  test("renders categories page", async ({ page }) => {
    await page.goto("/categories", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/browse our categories/i)).toBeVisible();
  });

  test("displays category cards", async ({ page }) => {
    await page.goto("/categories", { waitUntil: "domcontentloaded" });

    // Category cards should link to category pages
    const categoryLinks = page.locator(
      'a[href*="/categories/"], a[href*="/products/categories/"]',
    );
    await expect(categoryLinks.first()).toBeVisible({ timeout: 10000 });
  });

  test("has category banner", async ({ page }) => {
    await page.goto("/categories", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Shop by Category" }).first()).toBeVisible();
  });
});

test.describe("About Page", () => {
  test("renders about page with heading", async ({ page }) => {
    await page.goto("/about", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("About Doaba Sports")).toBeVisible();
  });

  test("shows company heritage section", async ({ page }) => {
    await page.goto("/about", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/our cricket heritage/i)).toBeVisible();
  });

  test("shows product range categories", async ({ page }) => {
    await page.goto("/about", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/cricket bats/i).first()).toBeVisible();
  });
});

test.describe("404 Page", () => {
  test("shows 404 for non-existent routes", async ({ page }) => {
    await page.goto("/this-page-does-not-exist", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });

  test("has link back to home", async ({ page }) => {
    await page.goto("/this-page-does-not-exist", { waitUntil: "domcontentloaded" });
    const homeLink = page.getByRole("link", { name: /home/i });
    await expect(homeLink).toBeVisible();
  });
});
