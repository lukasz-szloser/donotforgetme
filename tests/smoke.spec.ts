import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("should redirect to /login for unauthenticated users accessing /dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/);
  });

  test("should display login form and button", async ({ page }) => {
    await page.goto("/login");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check if login form elements are present
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/hasło|password/i);
    const submitButton = page.getByRole("button", { name: /zaloguj|login|sign in/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test("should display app title or heading on login page", async ({ page }) => {
    await page.goto("/login");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check if there's app title
    const title = page.locator("text=Packing Helper");
    await expect(title).toBeVisible();
  });

  test("should have proper meta tags", async ({ page }) => {
    await page.goto("/login");

    // Check for viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute("content", /width=device-width/);
  });
});
