import { test, expect } from "@playwright/test";
import { LoginPage, RegisterPage } from "../pom";

test.describe("Authentication", () => {
  test("login page renders correctly", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.expectVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
  });

  test("register page renders correctly", async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigate();
    await registerPage.expectVisible();
    await expect(registerPage.usernameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
    await expect(registerPage.submitButton).toBeVisible();
    await expect(registerPage.loginLink).toBeVisible();
  });

  test("unauthenticated user accessing /dashboard is redirected to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user accessing /create-transaction is redirected to /login", async ({
    page,
  }) => {
    await page.goto("/create-transaction");
    await page.waitForURL("**/login");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page has link to register", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("register page has link to login", async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigate();
    await registerPage.loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("register with mismatched passwords shows error", async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigate();
    await registerPage.fillForm(
      "testuser",
      "mismatch@test.com",
      "Password1!",
      "DifferentPassword1!"
    );
    await registerPage.submit();
    await registerPage.expectToast("Passwords do not match");
  });
});
