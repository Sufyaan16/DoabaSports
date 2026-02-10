import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("navbar shows brand name linking to home", async ({ page }) => {
    const brand = page.getByRole("link", { name: /doaba sports/i }).first();
    await expect(brand).toBeVisible();
    await expect(brand).toHaveAttribute("href", "/");
  });

  test("navbar has main navigation links", async ({ page }) => {
    // Desktop nav links (visible on lg+)
    const nav = page.locator("nav");
    await expect(nav.getByRole("link", { name: /^home$/i })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(
      nav.getByRole("link", { name: /^products$/i }),
    ).toHaveAttribute("href", "/products");
    await expect(
      nav.getByRole("link", { name: /^categories$/i }),
    ).toHaveAttribute("href", "/categories");
  });

  test("navigates to products page via navbar", async ({ page }) => {
    await page
      .locator("nav")
      .getByRole("link", { name: /^products$/i })
      .click();
    await expect(page).toHaveURL("/products");
    // Heading is rendered with Framer Motion letter-by-letter animation,
    // so getByText can't match it. Verify URL + page container instead.
    await expect(page.locator(".container").first()).toBeVisible();
  });

  test("navigates to categories page via navbar", async ({ page }) => {
    await page
      .locator("nav")
      .getByRole("link", { name: /^categories$/i })
      .click();
    await expect(page).toHaveURL("/categories");
  });

  test("navigates to about page via navbar", async ({ page }) => {
    await page
      .locator("nav")
      .getByRole("link", { name: /^about$/i })
      .click();
    await expect(page).toHaveURL("/about");
    await expect(page.getByText("About Doaba Sports")).toBeVisible();
  });

  test("shows sign-in link when not logged in", async ({ page }) => {
    const signIn = page.getByRole("link", { name: /sign in/i });
    await expect(signIn).toBeVisible();
    await expect(signIn).toHaveAttribute("href", /sign-in/);
  });
});
