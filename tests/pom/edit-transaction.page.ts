import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class EditTransactionPage extends BasePage {
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

  async expectVisible() {
    await expect(this.heading).toContainText("Edit Transaction Details");
  }

  async updateTitle(title: string) {
    await this.titleInput.fill(title);
  }

  async updateAmount(amount: string) {
    await this.amountInput.click();
    await this.amountInput.fill(amount);
  }

  async submit() {
    await this.submitButton.click();
  }

  async goBack() {
    await this.backButton.click();
  }
}
