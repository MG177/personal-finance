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
    await toast.waitFor({ state: "attached", timeout: 5_000 });
    // Ionic sets the message as a JS property; read it via evaluate
    const msg = await toast.evaluate(
      (el: HTMLElement) => (el as any).message ?? el.getAttribute("message") ?? el.textContent ?? ""
    );
    return msg;
  }

  /** Wait for a specific toast message text (contains). Polls all toasts. */
  async expectToast(text: string, timeoutMs = 10_000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const toasts = this.page.locator("ion-toast");
      const count = await toasts.count();
      for (let i = 0; i < count; i++) {
        const msg: string = await toasts.nth(i).evaluate(
          (el: HTMLElement) =>
            (el as any).message ??
            el.getAttribute("message") ??
            el.textContent ??
            ""
        );
        if (msg.toLowerCase().includes(text.toLowerCase())) return;
      }
      await this.page.waitForTimeout(300);
    }
    throw new Error(`Toast containing "${text}" not found within ${timeoutMs}ms`);
  }

  /** Get the page title from the IonToolbar. */
  get toolbarTitle(): Locator {
    return this.page.locator("ion-title");
  }
}
