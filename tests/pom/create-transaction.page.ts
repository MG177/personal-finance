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

  /** Select the first bank account from the react-select dropdown. */
  async selectFirstBankAccount() {
    const container = this.page.locator("#bank-account").locator("..").locator("..");
    const control = container.locator(".react-select__control");
    await control.click();
    const option = container.locator(".react-select__option").first();
    await option.waitFor({ state: "visible" });
    await option.click();
  }

  /** Select the first category from the react-select dropdown. */
  async selectFirstCategory() {
    const container = this.page.locator("#category").locator("..").locator("..");
    const control = container.locator(".react-select__control");
    await control.click();
    const option = container.locator(".react-select__option").first();
    await option.waitFor({ state: "visible" });
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
