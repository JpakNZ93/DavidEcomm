import { expect, test } from "@playwright/test";

test("homepage renders hero and featured products", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /premium fixtures for the spaces that matter most/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /featured products/i }),
  ).toBeVisible();
});

test("product page renders JSON-LD", async ({ page }) => {
  await page.goto("/products/avila-1500-fluted-oak");

  await expect(
    page.getByRole("heading", { name: /avila 1500 fluted oak vanity/i }),
  ).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
});
