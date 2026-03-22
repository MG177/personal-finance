import { test as base } from "@playwright/test";

/**
 * Extended test fixture that intercepts Strapi API requests to replace
 * the hardcoded invalid API token in strapi.js with the real JWT from
 * localStorage (set by globalSetup storageState).
 *
 * This works around a known bug where the axios instance in
 * frontend/src/api/strapi.js has a hardcoded Authorization header that
 * overrides the AuthContext's corrected header.
 */
export const test = base.extend<{ autoFixAuth: void }>({
  autoFixAuth: [
    async ({ page }, use) => {
      await page.route("**/api/**", async (route) => {
        const headers = { ...route.request().headers() };

        // Replace the hardcoded invalid token with the real JWT from context
        const storageState = await page.context().storageState();
        const origin = storageState.origins.find((o) =>
          o.origin.includes("localhost:3000")
        );
        const tokenEntry = origin?.localStorage.find(
          (e) => e.name === "token"
        );

        if (tokenEntry?.value) {
          headers["authorization"] = `Bearer ${tokenEntry.value}`;
        }

        await route.continue({ headers });
      });

      await use();
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
