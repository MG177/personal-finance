import { type Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class LoginPage extends BasePage {
  readonly emailInput = this.page.locator('input#email');
  readonly passwordInput = this.page.locator('input#password');
  readonly submitButton = this.page.locator('ion-button[type="submit"]');
  readonly registerLink = this.page.locator('ion-button[router-link="/register"]');
  readonly heading = this.page.locator("ion-card-title");

  constructor(page: Page) {
    super(page);
  }

  async navigate() {
    await this.goto("/login");
  }

  async fillCredentials(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.fillCredentials(email, password);
    await this.submit();
  }

  async expectVisible() {
    await expect(this.heading).toContainText("Login");
  }
}
