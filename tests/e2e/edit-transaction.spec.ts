import { test, expect } from "../fixtures";
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
    // Create a transaction with bank_account and category via the UI first
    // to ensure it has all required relations for editing
    const { CreateTransactionPage } = await import("../pom");
    const createPage = new CreateTransactionPage(page);
    await createPage.navigate();
    await createPage.expectVisible();
    await page.waitForTimeout(3_000);

    await createPage.selectType("expense");
    await createPage.selectFirstBankAccount();
    await createPage.selectFirstCategory();
    await createPage.fillTitle("To Be Edited");
    await createPage.fillAmount("100");

    const createResponsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/transactions") &&
        resp.request().method() === "POST",
      { timeout: 15_000 }
    );
    await createPage.submit();
    await createResponsePromise;
    await page.waitForURL("**/dashboard", { timeout: 15_000 });

    const dashboard = new DashboardPage(page);
    await dashboard.waitForTransactionsLoaded();
    await page.waitForTimeout(2_000);

    // Now edit the first transaction (which should be "To Be Edited" since sorted by updatedAt desc)
    await dashboard.editTransaction(0);
    await page.waitForURL(/\/edit-transaction\//);

    const editPage = new EditTransactionPage(page);
    await editPage.expectVisible();

    // Wait for the form to fully load
    await page.waitForTimeout(5_000);
    await expect(editPage.titleInput).not.toHaveValue("");

    const newTitle = `Updated E2E ${Date.now()}`;
    await editPage.updateTitle(newTitle);

    // Also manually select bank account and category to ensure they're set
    // (In case the loaded transaction's relations aren't preserved in form state)
    const bankGroup = page.locator('.form-group:has(label[for="bank-account"])').last();
    const bankControl = bankGroup.locator(".react-select__control");
    await bankControl.click();
    const bankMenu = bankGroup.locator(".react-select__menu");
    await bankMenu.waitFor({ state: "visible", timeout: 5_000 });
    await bankMenu.locator(".react-select__option").first().click();

    const catGroup = page.locator('.form-group:has(label[for="category"])').last();
    const catControl = catGroup.locator(".react-select__control");
    await catControl.click();
    const catMenu = catGroup.locator(".react-select__menu");
    await catMenu.waitFor({ state: "visible", timeout: 5_000 });
    await catMenu.locator(".react-select__option").first().click();

    // Set up response listener before submit
    const putResponsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/transactions/") &&
        resp.request().method() === "PUT",
      { timeout: 15_000 }
    );
    await editPage.submit();
    const response = await putResponsePromise;
    expect(response.status()).toBeLessThan(400);

    await page.waitForURL("**/dashboard", { timeout: 15_000 });
    await dashboard.waitForTransactionsLoaded();
    await page.waitForTimeout(2_000);

    const titles = await dashboard.getTransactionTitles();
    expect(titles).toContain(newTitle);
  });
});
