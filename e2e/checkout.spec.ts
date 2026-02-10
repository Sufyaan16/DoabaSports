import { test, expect } from "@playwright/test";

test.describe("Checkout Page (unauthenticated)", () => {
  test("shows empty cart message when cart is empty", async ({ page }) => {
    await page.goto("/checkout", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
  });

  test("has continue shopping link from empty cart", async ({ page }) => {
    await page.goto("/checkout", { waitUntil: "domcontentloaded" });
    const continueLink = page.getByRole("link", {
      name: /continue shopping/i,
    });
    await expect(continueLink).toBeVisible();
    await expect(continueLink).toHaveAttribute("href", "/products");
  });
});

test.describe("Cart → Checkout flow (unauthenticated)", () => {
  test("can add item to cart and see it in checkout", async ({ page }) => {
    // Set up response listener BEFORE navigation to avoid race condition
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/products") && resp.status() === 200,
    );
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    await responsePromise;

    // Click on first product to go to detail page
    const firstProduct = page.locator('a[href^="/products/"]').first();
    await firstProduct.click();
    await expect(page).toHaveURL(/\/products\/\d+/);

    // Click Add to Cart
    const addToCartBtn = page.getByRole("button", { name: /add to cart/i });
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // Should see a toast or cart update indication
    // Navigate to checkout
    await page.goto("/checkout", { waitUntil: "domcontentloaded" });

    // Should NOT show empty cart message (item was added)
    await expect(page.getByText(/your cart is empty/i)).not.toBeVisible({
      timeout: 5000,
    });

    // Should show checkout form
    await expect(page.getByText(/checkout/i).first()).toBeVisible();
  });
});

test.describe("Orders Page (unauthenticated)", () => {
  test("shows sign-in required when not logged in", async ({ page }) => {
    await page.goto("/orders", { waitUntil: "domcontentloaded" });

    // Should prompt to sign in or redirect
    await expect(
      page.getByText(/sign in/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });
});
