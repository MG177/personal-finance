import { test, expect } from "../fixtures";
import { CreateTransactionPage, DashboardPage } from "../pom";

test.describe("Create Transaction", () => {
  test("page renders with all form fields", async ({ page }) => {
    const createPage = new CreateTransactionPage(page);
    await createPage.navigate();
    await createPage.expectVisible();
    await expect(createPage.typeSelect).toBeVisible();
    await expect(createPage.titleInput).toBeVisible();
    await expect(createPage.amountInput).toBeVisible();
    await expect(createPage.submitButton).toBeVisible();
  });

  test("submitting without required fields stays on page", async ({
    page,
  }) => {
    const createPage = new CreateTransactionPage(page);
    await createPage.navigate();
    await createPage.expectVisible();
    // Wait for initial API calls to settle
    await page.waitForTimeout(5_000);
    // Only fill title, skip bank account and category
    await createPage.fillTitle("Incomplete");
    await createPage.fillAmount("50");
    await createPage.submit();
    // Form should NOT navigate away — still on /create-transaction
    await page.waitForTimeout(2_000);
    await createPage.expectPath("/create-transaction");
  });

  test("create an expense transaction end-to-end", async ({ page }) => {
    const createPage = new CreateTransactionPage(page);
    await createPage.navigate();
    await createPage.expectVisible();
    // Wait for API data (bank accounts, categories) to load
    await page.waitForTimeout(3_000);

    await createPage.selectType("expense");
    await createPage.selectFirstBankAccount();
    await createPage.selectFirstCategory();
    await createPage.fillTitle("E2E Test Expense");
    await createPage.fillAmount("250");

    // Listen for the POST to transactions
    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/transactions") &&
        resp.request().method() === "POST",
      { timeout: 15_000 }
    );

    await createPage.submit();
    const response = await responsePromise;
    expect(response.status()).toBeLessThan(400);

    // Navigate to dashboard and verify
    await page.waitForURL("**/dashboard", { timeout: 15_000 });
    const dashboard = new DashboardPage(page);
    await dashboard.waitForTransactionsLoaded();
    // Allow a moment for the transaction list to render
    await page.waitForTimeout(2_000);

    const titles = await dashboard.getTransactionTitles();
    expect(titles).toContain("E2E Test Expense");
  });

  test("create an income transaction end-to-end", async ({ page }) => {
    const createPage = new CreateTransactionPage(page);
    await createPage.navigate();
    await createPage.expectVisible();
    await page.waitForTimeout(3_000);

    await createPage.selectType("income");
    await createPage.selectFirstBankAccount();
    await createPage.selectFirstCategory();
    await createPage.fillTitle("E2E Test Income");
    await createPage.fillAmount("1000");

    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/transactions") &&
        resp.request().method() === "POST",
      { timeout: 15_000 }
    );

    await createPage.submit();
    const response = await responsePromise;
    expect(response.status()).toBeLessThan(400);

    await page.waitForURL("**/dashboard", { timeout: 15_000 });
    const dashboard = new DashboardPage(page);
    await dashboard.waitForTransactionsLoaded();
    await page.waitForTimeout(2_000);

    const titles = await dashboard.getTransactionTitles();
    expect(titles).toContain("E2E Test Income");
  });

  test("transaction type defaults to expense", async ({ page }) => {
    const createPage = new CreateTransactionPage(page);
    await createPage.navigate();
    await expect(createPage.typeSelect).toHaveValue("expense");
  });
});
