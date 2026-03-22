import { test, expect } from "../fixtures";
import { DashboardPage } from "../pom";

test.describe("Dashboard", () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.expectVisible();
    await dashboard.waitForTransactionsLoaded();
  });

  test("displays seeded transactions", async () => {
    const count = await dashboard.getTransactionCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("shows Recent Transactions heading", async ({ page }) => {
    await expect(page.locator("ion-card-title")).toContainText(
      "Recent Transactions"
    );
  });

  test("segment tabs ALL / EXPENSES / INCOMES are visible", async () => {
    await expect(dashboard.segmentAll).toBeVisible();
    await expect(dashboard.segmentExpenses).toBeVisible();
    await expect(dashboard.segmentIncomes).toBeVisible();
  });

  test("filtering by expenses shows only expense transactions", async ({
    page,
  }) => {
    await dashboard.filterByType("expense");
    await dashboard.waitForTransactionsLoaded();
    const items = page.locator(".transaction-content.expense");
    const count = await items.count();
    // All visible items should be expense type
    const totalItems = await dashboard.transactionItems.count();
    if (totalItems > 0) {
      expect(count).toBe(totalItems);
    }
  });

  test("filtering by incomes shows only income transactions", async ({
    page,
  }) => {
    await dashboard.filterByType("income");
    await dashboard.waitForTransactionsLoaded();
    const items = page.locator(".transaction-content.income");
    const count = await items.count();
    const totalItems = await dashboard.transactionItems.count();
    if (totalItems > 0) {
      expect(count).toBe(totalItems);
    }
  });

  test("search bar filters transactions by text", async () => {
    await dashboard.searchTransactions("Seeded");
    await dashboard.waitForTransactionsLoaded();
    const titles = await dashboard.getTransactionTitles();
    for (const t of titles) {
      expect(t.toLowerCase()).toContain("seeded");
    }
  });

  test("search for non-existent term shows empty state", async () => {
    await dashboard.searchTransactions("xyznonexistent");
    await dashboard.waitForTransactionsLoaded();
    await expect(dashboard.emptyMessage).toBeVisible();
  });

  test("date range selector is visible", async () => {
    await expect(dashboard.dateSelect).toBeVisible();
  });

  test("FAB button for creating transactions is visible", async () => {
    await expect(dashboard.fab).toBeVisible();
  });
});
