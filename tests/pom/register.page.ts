import { type Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class RegisterPage extends BasePage {
  readonly usernameInput = this.page.locator("input#username");
  readonly emailInput = this.page.locator("input#email");
  readonly passwordInput = this.page.locator("input#password");
  readonly confirmPasswordInput = this.page.locator("input#confirmPassword");
  readonly submitButton = this.page.locator('ion-button[type="submit"]');
  readonly loginLink = this.page.locator('ion-button[router-link="/login"]');
  readonly heading = this.page.locator("ion-card-title");

  constructor(page: Page) {
    super(page);
  }

  async navigate() {
    await this.goto("/register");
  }

  async fillForm(
    username: string,
    email: string,
    password: string,
    confirmPassword?: string
  ) {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword ?? password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async expectVisible() {
    await expect(this.heading).toContainText("Register");
  }
}
