import { test, expect } from "@playwright/test";

test.describe("Products Page", () => {
  test("renders page heading", async ({ page }) => {
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    // "All Products" is rendered via Framer Motion letter-by-letter spans,
    // so getByText won't match. Check for each word individually.
    await expect(page.locator("text=All").first()).toBeVisible();
    await expect(page.locator("text=Products").first()).toBeVisible();
    await expect(
      page.getByText(/explore our complete collection/i),
    ).toBeVisible();
  });

  test("displays product cards", async ({ page }) => {
    // Set up response listener BEFORE navigation to avoid race condition
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/products") && resp.status() === 200,
    );
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    await responsePromise;

    // At least one product card should be visible
    const productLinks = page.locator('a[href^="/products/"]');
    await expect(productLinks.first()).toBeVisible();
  });

  test("has category filter pills", async ({ page }) => {
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("All Categories")).toBeVisible();
  });

  test("has sort dropdown", async ({ page }) => {
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/newest first/i)).toBeVisible();
  });

  test("has view mode toggle", async ({ page }) => {
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    const buttons = page.getByRole("button");
    expect(await buttons.count()).toBeGreaterThan(0);
  });
});

test.describe("Product Detail Page", () => {
  test("navigates to product detail from products page", async ({ page }) => {
    // Set up response listener BEFORE navigation
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/products") && resp.status() === 200,
    );
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    await responsePromise;

    // Click the first product card
    // Use a selector that matches product detail links (/products/123) but NOT category links (/products/categories/...)
    const firstProduct = page.locator('a[href*="/products/"]:not([href*="/categories/"])').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();

    // Should navigate to a product detail page
    await expect(page).toHaveURL(new RegExp(`/products/\\d+`));
  });

  test("shows Add to Cart button on product detail", async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/products") && resp.status() === 200,
    );
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    await responsePromise;

    const firstProduct = page.locator('a[href*="/products/"]:not([href*="/categories/"])').first();
    await firstProduct.click();

    await expect(page).toHaveURL(new RegExp(`/products/\\d+`));
    await expect(
      page.getByRole("button", { name: /add to cart/i }),
    ).toBeVisible();
  });
});
