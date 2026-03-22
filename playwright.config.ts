import { defineConfig, devices } from "@playwright/test";
import path from "path";

const FRONTEND_URL = process.env.E2E_FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL = process.env.E2E_BACKEND_URL || "http://localhost:1337";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "html",
  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: FRONTEND_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
      teardown: "cleanup",
    },
    {
      name: "cleanup",
      testMatch: /global\.teardown\.ts/,
    },
    {
      name: "authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: path.join(__dirname, "tests/.auth/user.json"),
      },
      dependencies: ["setup"],
      testIgnore: /auth\.spec\.ts/,
    },
    {
      name: "guest",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /auth\.spec\.ts/,
    },
  ],

  webServer: [
    {
      command: "npm run develop",
      cwd: path.join(__dirname, "backend"),
      url: `${BACKEND_URL}/admin`,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "BROWSER=none npm start",
      cwd: path.join(__dirname, "frontend"),
      url: FRONTEND_URL,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
