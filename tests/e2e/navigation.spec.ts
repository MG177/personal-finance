import { test, expect } from "../fixtures";
import { DashboardPage, CreateTransactionPage } from "../pom";

test.describe("Navigation", () => {
  test("root path / redirects to /dashboard", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL("**/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("dashboard toolbar shows title and logout", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.expectVisible();
    await expect(dashboard.logoutButton).toBeVisible();
  });

  test("FAB navigates to create-transaction", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.waitForTransactionsLoaded();
    await dashboard.clickCreateTransaction();
    await expect(page).toHaveURL(/\/create-transaction/);
  });

  test("create-transaction back button returns to dashboard", async ({
    page,
  }) => {
    const createPage = new CreateTransactionPage(page);
    await createPage.navigate();
    await createPage.expectVisible();
    await createPage.goBack();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("logout returns to login page", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.expectVisible();
    await dashboard.logout();
    await expect(page).toHaveURL(/\/login/);
  });
});
