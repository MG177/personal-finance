import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class DashboardPage extends BasePage {
  readonly logoutButton: Locator;
  readonly segmentAll: Locator;
  readonly segmentExpenses: Locator;
  readonly segmentIncomes: Locator;
  readonly searchBar: Locator;
  readonly dateSelect: Locator;
  readonly transactionList: Locator;
  readonly transactionItems: Locator;
  readonly emptyMessage: Locator;
  readonly fab: Locator;
  readonly spinner: Locator;
  readonly deleteAlert: Locator;

  constructor(page: Page) {
    super(page);
    this.logoutButton = page.locator('[data-testid="logout-button"]');
    this.segmentAll = page.locator('ion-segment-button[value="all"]');
    this.segmentExpenses = page.locator('ion-segment-button[value="expense"]');
    this.segmentIncomes = page.locator('ion-segment-button[value="income"]');
    this.searchBar = page.locator("ion-searchbar");
    this.dateSelect = page.locator("ion-select");
    this.transactionList = page.locator("ion-list");
    this.transactionItems = page.locator("ion-item.transaction-item");
    this.emptyMessage = page.locator("text=No transactions found");
    this.fab = page.locator("ion-fab-button");
    this.spinner = page.locator("ion-spinner");
    this.deleteAlert = page.locator("ion-alert");
  }

  async navigate() {
    await this.goto("/dashboard");
  }

  async expectVisible() {
    await expect(this.toolbarTitle.first()).toContainText("Dashboard");
  }

  async waitForTransactionsLoaded() {
    // Wait for spinner to disappear
    await this.spinner.waitFor({ state: "hidden", timeout: 15_000 }).catch(() => {});
  }

  async getTransactionCount(): Promise<number> {
    await this.waitForTransactionsLoaded();
    return this.transactionItems.count();
  }

  async getTransactionTitles(): Promise<string[]> {
    await this.waitForTransactionsLoaded();
    const items = this.page.locator(".transaction-title span");
    return items.allTextContents();
  }

  async filterByType(type: "all" | "expense" | "income") {
    const segment = this.page.locator(
      `ion-segment-button[value="${type}"]`
    );
    await segment.click();
    // Wait for refetch
    await this.page.waitForTimeout(1_000);
  }

  async searchTransactions(text: string) {
    await this.searchBar.locator("input").fill(text);
    // Debounce is 1000ms
    await this.page.waitForTimeout(1_500);
  }

  async clickCreateTransaction() {
    await this.fab.click();
  }

  async editTransaction(index: number) {
    const editButtons = this.page.locator('[data-testid="edit-transaction"]');
    await editButtons.nth(index).click();
  }

  async deleteTransaction(index: number) {
    const deleteButtons = this.page.locator('[data-testid="delete-transaction"]');
    await deleteButtons.nth(index).click();
  }

  async confirmDelete() {
    // IonAlert confirm button
    const alertBtn = this.page.locator(
      'ion-alert button:has-text("Delete")'
    );
    await alertBtn.click();
  }

  async cancelDelete() {
    const alertBtn = this.page.locator(
      'ion-alert button:has-text("Cancel")'
    );
    await alertBtn.click();
  }

  async logout() {
    await this.logoutButton.click();
  }
}
