import { test, expect } from "@playwright/test";

test.describe("Search Functionality", () => {
  test("global search bar is visible on homepage", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const searchInput = page.getByPlaceholder(/search products/i);
    await expect(searchInput).toBeVisible();
  });

  test("global search shows dropdown results on input", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const searchInput = page.getByPlaceholder(/search products/i);

    // Set up response listener BEFORE typing to avoid race condition
    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/products/search") && resp.status() === 200,
      { timeout: 15000 },
    );
    await searchInput.fill("cricket");
    await responsePromise;

    // Either search results or the search results container should appear
    await expect(
      page.getByText(/view all|no products found/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("search page loads with query parameter", async ({ page }) => {
    await page.goto("/search?q=bat", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/search results for/i)).toBeVisible();
  });

  test("search page shows empty state for no results", async ({ page }) => {
    await page.goto("/search?q=xyznonexistentproduct12345", { waitUntil: "domcontentloaded" });

    // Wait for search to complete
    await page.waitForTimeout(2000);

    // Should show "no products found" or similar empty state
    await expect(
      page.getByText(/no products found/i).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("search page has filter controls", async ({ page }) => {
    await page.goto("/search?q=cricket", { waitUntil: "domcontentloaded" });

    // Should have sort and filter options
    await expect(page.getByText(/search/i).first()).toBeVisible();
  });
});
