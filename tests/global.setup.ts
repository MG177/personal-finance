import { test as setup, expect } from "@playwright/test";
import path from "path";

const BACKEND_URL = process.env.E2E_BACKEND_URL || "http://localhost:1337";
const E2E_USER_EMAIL = process.env.E2E_USER_EMAIL || "e2e@test.local";
const E2E_USER_PASSWORD = process.env.E2E_USER_PASSWORD || "E2eTest1234!";
const E2E_USER_NAME = process.env.E2E_USER_NAME || "e2euser";
const AUTH_FILE = path.join(__dirname, ".auth/user.json");

setup("authenticate and seed E2E user", async ({ request, browser }) => {
  // 1. Register or login the E2E user via Strapi REST API
  let jwt: string;
  let user: Record<string, unknown>;

  const loginRes = await request.post(`${BACKEND_URL}/api/auth/local`, {
    data: { identifier: E2E_USER_EMAIL, password: E2E_USER_PASSWORD },
  });

  if (loginRes.ok()) {
    const body = await loginRes.json();
    jwt = body.jwt;
    user = body.user;
  } else {
    // User doesn't exist yet — register
    const regRes = await request.post(
      `${BACKEND_URL}/api/auth/local/register`,
      {
        data: {
          username: E2E_USER_NAME,
          email: E2E_USER_EMAIL,
          password: E2E_USER_PASSWORD,
        },
      }
    );
    expect(regRes.ok()).toBeTruthy();
    const body = await regRes.json();
    jwt = body.jwt;
    user = body.user;
  }

  // 2. Seed minimum data: 2 bank accounts, 2 categories
  const headers = { Authorization: `Bearer ${jwt}` };

  const bankAccountsRes = await request.get(
    `${BACKEND_URL}/api/bank-accounts`,
    { headers }
  );
  const existingAccounts = (await bankAccountsRes.json()).data ?? [];

  if (existingAccounts.length < 2) {
    const accountsToCreate = [
      {
        account_name: "Main Checking",
        bank_name: "Test Bank",
        currency: "USD",
      },
      { account_name: "Savings", bank_name: "Test Bank", currency: "IDR" },
    ];
    for (const acc of accountsToCreate) {
      await request.post(`${BACKEND_URL}/api/bank-accounts`, {
        headers,
        data: { data: acc },
      });
    }
  }

  const categoriesRes = await request.get(`${BACKEND_URL}/api/categories`, {
    headers,
  });
  const existingCategories = (await categoriesRes.json()).data ?? [];

  if (existingCategories.length < 2) {
    const categoriesToCreate = [
      { category_name: "Food & Dining" },
      { category_name: "Salary" },
    ];
    for (const cat of categoriesToCreate) {
      await request.post(`${BACKEND_URL}/api/categories`, {
        headers,
        data: { data: cat },
      });
    }
  }

  // 3. Seed a transaction for dashboard tests
  const txRes = await request.get(`${BACKEND_URL}/api/transactions`, {
    headers,
  });
  const existingTx = (await txRes.json()).data ?? [];

  if (existingTx.length === 0) {
    // Refetch bank accounts and categories to get their IDs
    const baRes = await request.get(`${BACKEND_URL}/api/bank-accounts`, {
      headers,
    });
    const bas = (await baRes.json()).data;
    const catRes = await request.get(`${BACKEND_URL}/api/categories`, {
      headers,
    });
    const cats = (await catRes.json()).data;

    await request.post(`${BACKEND_URL}/api/transactions`, {
      headers,
      data: {
        data: {
          title: "Seeded Expense",
          amount: 100,
          transaction_type: "expense",
          date: new Date().toISOString().split("T")[0],
          bank_account: bas[0]?.id,
          category: cats[0]?.id,
        },
      },
    });

    await request.post(`${BACKEND_URL}/api/transactions`, {
      headers,
      data: {
        data: {
          title: "Seeded Income",
          amount: 5000,
          transaction_type: "income",
          date: new Date().toISOString().split("T")[0],
          bank_account: bas[0]?.id,
          category: cats[1]?.id,
        },
      },
    });
  }

  // 4. Create a browser context with localStorage auth and save storageState
  const context = await browser.newContext();
  const page = await context.newPage();
  const frontendUrl = process.env.E2E_FRONTEND_URL || "http://localhost:3000";

  await page.goto(frontendUrl + "/login");
  await page.evaluate(
    ({ token, userData }) => {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
    },
    { token: jwt, userData: user }
  );

  await page.context().storageState({ path: AUTH_FILE });
  await context.close();
});
