import { test, expect } from "@playwright/test";
import { DashboardPage, EditTransactionPage } from "../pom";

test.describe("Edit Transaction", () => {
  test("navigating to edit loads the form with existing data", async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.waitForTransactionsLoaded();

    const count = await dashboard.getTransactionCount();
    test.skip(count === 0, "No transactions to edit");

    await dashboard.editTransaction(0);
    await page.waitForURL(/\/edit-transaction\//);

    const editPage = new EditTransactionPage(page);
    await editPage.expectVisible();

    // Title should be pre-filled
    await expect(editPage.titleInput).not.toBeEmpty();
  });

  test("edit page has back button to dashboard", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.waitForTransactionsLoaded();

    const count = await dashboard.getTransactionCount();
    test.skip(count === 0, "No transactions to edit");

    await dashboard.editTransaction(0);
    await page.waitForURL(/\/edit-transaction\//);

    const editPage = new EditTransactionPage(page);
    await editPage.goBack();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("update transaction title", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.waitForTransactionsLoaded();

    const count = await dashboard.getTransactionCount();
    test.skip(count === 0, "No transactions to edit");

    await dashboard.editTransaction(0);
    await page.waitForURL(/\/edit-transaction\//);

    const editPage = new EditTransactionPage(page);
    await editPage.expectVisible();

    const newTitle = `Updated E2E ${Date.now()}`;
    await editPage.updateTitle(newTitle);
    await editPage.submit();

    await page.waitForURL("**/dashboard", { timeout: 10_000 });
    await dashboard.waitForTransactionsLoaded();

    const titles = await dashboard.getTransactionTitles();
    expect(titles).toContain(newTitle);
  });
});
