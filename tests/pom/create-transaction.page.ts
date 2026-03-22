import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class CreateTransactionPage extends BasePage {
  readonly heading: Locator;
  readonly typeSelect: Locator;
  readonly titleInput: Locator;
  readonly amountInput: Locator;
  readonly submitButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator("h1.form-title");
    this.typeSelect = page.locator("#transaction-type");
    this.titleInput = page.locator("#title");
    this.amountInput = page.locator("#amount");
    this.submitButton = page.locator('ion-button[type="submit"]');
    this.backButton = page.locator("ion-back-button");
  }

  async navigate() {
    await this.goto("/create-transaction");
  }

  async expectVisible() {
    await expect(this.heading).toContainText("Create New Transaction");
  }

  async selectType(type: "expense" | "income") {
    await this.typeSelect.selectOption(type);
  }

  async fillTitle(title: string) {
    await this.titleInput.fill(title);
  }

  async fillAmount(amount: string) {
    await this.amountInput.click();
    await this.amountInput.fill(amount);
  }

  /** Wait for bank accounts to load, then select the first one. */
  async selectFirstBankAccount() {
    const group = this.page.locator('.form-group:has(label[for="bank-account"])');
    const control = group.locator(".react-select__control");
    // Wait for the dropdown to have a value-container populated by API data
    await this.page.waitForTimeout(1_000);
    await control.click();
    const menu = group.locator(".react-select__menu");
    await menu.waitFor({ state: "visible", timeout: 10_000 });
    const option = menu.locator(".react-select__option").first();
    await option.click();
  }

  /** Wait for categories to load, then select the first one. */
  async selectFirstCategory() {
    const group = this.page.locator('.form-group:has(label[for="category"])');
    const control = group.locator(".react-select__control");
    await this.page.waitForTimeout(500);
    await control.click();
    const menu = group.locator(".react-select__menu");
    await menu.waitFor({ state: "visible", timeout: 10_000 });
    const option = menu.locator(".react-select__option").first();
    await option.click();
  }

  async submit() {
    await this.submitButton.click();
  }

  /**
   * Fill all required fields and submit a transaction.
   */
  async createTransaction(opts: {
    type?: "expense" | "income";
    title: string;
    amount: string;
  }) {
    if (opts.type) await this.selectType(opts.type);
    await this.selectFirstBankAccount();
    await this.selectFirstCategory();
    await this.fillTitle(opts.title);
    await this.fillAmount(opts.amount);
    await this.submit();
  }

  async goBack() {
    await this.backButton.click();
  }
}
