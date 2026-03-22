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
    this.heading = page.getByRole("heading", { name: "Edit Transaction Details" });
    // Use nth(-1) to target the last matching element (the active Ionic page)
    this.typeSelect = page.locator("#transaction-type").last();
    this.titleInput = page.locator("#title").last();
    this.amountInput = page.locator("#amount").last();
    this.submitButton = page.locator('ion-button[type="submit"]').last();
    this.backButton = page.locator("ion-back-button").last();
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
