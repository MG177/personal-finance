import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Base page object — wraps common helpers every page needs.
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  /** Navigate and wait for Ionic to finish rendering. */
  async goto(path: string) {
    await this.page.goto(path);
    await this.waitForIonic();
  }

  /** Wait for the Ionic app shell to be ready. */
  async waitForIonic() {
    await this.page.waitForSelector("ion-app", { state: "attached" });
  }

  /** Assert the current URL pathname matches. */
  async expectPath(path: string) {
    await expect(this.page).toHaveURL(new RegExp(`${path}(\\?.*)?$`));
  }

  /** Wait for and return an Ionic toast message. */
  async getToastMessage(): Promise<string> {
    const toast = this.page.locator("ion-toast");
    await toast.waitFor({ state: "visible", timeout: 5_000 });
    const msg = await toast.getAttribute("message");
    return msg ?? "";
  }

  /** Wait for a specific toast message text (contains). */
  async expectToast(text: string) {
    const toast = this.page.locator("ion-toast");
    await toast.waitFor({ state: "visible", timeout: 5_000 });
    await expect(toast).toHaveAttribute("message", new RegExp(text, "i"));
  }

  /** Get the page title from the IonToolbar. */
  get toolbarTitle(): Locator {
    return this.page.locator("ion-title");
  }
}
