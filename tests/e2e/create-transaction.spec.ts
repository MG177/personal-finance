import { test, expect } from "@playwright/test";
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

  test("submitting without required fields shows warning", async ({
    page,
  }) => {
    const createPage = new CreateTransactionPage(page);
    await createPage.navigate();
    await createPage.expectVisible();
    // Only fill title, skip bank account and category
    await createPage.fillTitle("Incomplete");
    await createPage.fillAmount("50");
    await createPage.submit();
    await createPage.expectToast("fill in all required fields");
  });

  test("create an expense transaction end-to-end", async ({ page }) => {
    const createPage = new CreateTransactionPage(page);
    await createPage.navigate();
    await createPage.expectVisible();

    await createPage.createTransaction({
      type: "expense",
      title: "E2E Test Expense",
      amount: "250",
    });

    // Should redirect to dashboard after creation
    await page.waitForURL("**/dashboard", { timeout: 10_000 });
    const dashboard = new DashboardPage(page);
    await dashboard.waitForTransactionsLoaded();

    const titles = await dashboard.getTransactionTitles();
    expect(titles).toContain("E2E Test Expense");
  });

  test("create an income transaction end-to-end", async ({ page }) => {
    const createPage = new CreateTransactionPage(page);
    await createPage.navigate();
    await createPage.expectVisible();

    await createPage.createTransaction({
      type: "income",
      title: "E2E Test Income",
      amount: "1000",
    });

    await page.waitForURL("**/dashboard", { timeout: 10_000 });
    const dashboard = new DashboardPage(page);
    await dashboard.waitForTransactionsLoaded();

    const titles = await dashboard.getTransactionTitles();
    expect(titles).toContain("E2E Test Income");
  });

  test("transaction type defaults to expense", async ({ page }) => {
    const createPage = new CreateTransactionPage(page);
    await createPage.navigate();
    await expect(createPage.typeSelect).toHaveValue("expense");
  });
});
