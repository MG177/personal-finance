# E2E Tests — Playwright

End-to-end tests for the Personal Finance Tracker using [Playwright](https://playwright.dev/) with a **Page Object Model** (POM) architecture.

## Architecture

```
tests/
├── .auth/              # Gitignored — storageState JSON written by globalSetup
├── pom/                # Page Object Model classes
│   ├── base.page.ts    # Shared helpers (goto, toast, waitForIonic)
│   ├── login.page.ts
│   ├── register.page.ts
│   ├── dashboard.page.ts
│   ├── create-transaction.page.ts
│   ├── edit-transaction.page.ts
│   └── index.ts        # Barrel export
├── e2e/                # Test specs
│   ├── auth.spec.ts           # Login/register page rendering, redirects
│   ├── navigation.spec.ts     # Route navigation, back buttons, logout
│   ├── dashboard.spec.ts      # Transaction list, filters, search
│   ├── create-transaction.spec.ts  # Create expense/income end-to-end
│   └── edit-transaction.spec.ts    # Edit flow end-to-end
├── global.setup.ts     # Creates E2E user + seeds data + saves storageState
└── global.teardown.ts  # No-op (data is ephemeral)
```

## Prerequisites

1. **Backend** running at `http://localhost:1337` (Strapi with SQLite)
2. **Frontend** running at `http://localhost:3000` (React dev server)

Both are started automatically by `webServer` in `playwright.config.ts` when not already running.

## Environment Variables

Copy `.env.example` to `.env` at the workspace root. Defaults work out of the box for local dev:

| Variable | Default | Purpose |
|----------|---------|---------|
| `E2E_BACKEND_URL` | `http://localhost:1337` | Strapi backend URL |
| `E2E_FRONTEND_URL` | `http://localhost:3000` | React frontend URL |
| `E2E_USER_EMAIL` | `e2e@test.local` | E2E test user email |
| `E2E_USER_PASSWORD` | `E2eTest1234!` | E2E test user password |
| `E2E_USER_NAME` | `e2euser` | E2E test user username |

## Running Tests

```bash
# From workspace root — all tests
npm run test:e2e

# Headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through)
npm run test:e2e:debug

# Playwright UI
npm run test:e2e:ui
```

## Projects

| Project | Auth | Runs |
|---------|------|------|
| `setup` | — | Creates E2E user, seeds data, writes `tests/.auth/user.json` |
| `authenticated` | storageState | All specs except `auth.spec.ts` |
| `guest` | none | `auth.spec.ts` only (tests unauthenticated flows) |
| `cleanup` | — | No-op teardown |

## How Auth Works

The `global.setup.ts` script:

1. Registers (or logs in) the E2E user via Strapi REST API directly (bypassing the frontend's hardcoded token bug in `strapi.js`).
2. Seeds bank accounts, categories, and sample transactions via API.
3. Opens a browser page, injects `token` + `user` into `localStorage`, and saves `storageState` to `tests/.auth/user.json`.
4. The `authenticated` project reuses this storage state so every spec starts logged in.

## Known Limitations

- **Frontend login/register forms** are broken due to a hardcoded invalid API token in `frontend/src/api/strapi.js` — auth tests verify page rendering and redirects but cannot test a full login flow through the UI.
- **Delete endpoint** in `Dashboard.js` uses wrong paths (`/expanses`, `/incomes`) — delete tests may fail at the API level.
