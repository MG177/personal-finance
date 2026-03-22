# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Personal Finance Tracker — a Strapi v5 backend + React/Ionic frontend monorepo.

| Service | Directory | Dev Command | Port |
|---------|-----------|-------------|------|
| Strapi backend | `backend/` | `npm run develop` | 1337 |
| React frontend | `frontend/` | `npm start` | 3000 |

### Running services

1. **Backend first**: `cd backend && npm run develop` — uses SQLite by default (no external DB needed). On first run, creates admin at `http://localhost:1337/admin`.
2. **Frontend**: `cd frontend && BROWSER=none npm start` — connects to Strapi at `http://localhost:1337` (configured in `frontend/.env`).
3. Backend `.env` must exist before starting Strapi. Copy from `.env.example` and fill secrets with random base64 values (see `.env.example` for template).

### Permissions setup

After fresh Strapi start with empty DB, the Authenticated role has all API permissions disabled. You must enable CRUD permissions for `bank-account`, `category`, `tag`, `transaction`, `default-bank-account`, `upload`, and `users-permissions` (auth + user/me) via the admin panel or the `/users-permissions/roles/1` PUT endpoint.

### Testing caveats

- **Frontend tests (`npm test`)**: Pre-existing failure — axios v1.x uses ESM which CRA's Jest config does not support. Tests fail with `SyntaxError: Cannot use import statement outside a module`. This is not a setup issue.
- **No backend tests** are configured in the repo.
- The user has requested: **DO NOT RUN ESLINT AND BUILD COMMAND**.

### Known pre-existing bugs

- **Hardcoded invalid API token in `frontend/src/api/strapi.js`**: The axios instance has a hardcoded `Authorization: Bearer <token>` default header. This token is invalid and causes 401 errors on ALL requests made through `strapiAPI`, including auth endpoints (`auth/local`, `auth/local/register`). The `AuthContext` overrides this header after login, but the login/register flow itself fails because the invalid token is sent with the auth request. The backend curl API works fine without this token. To test the frontend end-to-end, either fix the hardcoded token or inject valid credentials into localStorage.
- **Frontend tests broken**: axios v1.x uses ESM which CRA's Jest config doesn't support. `npm test` fails with `SyntaxError: Cannot use import statement outside a module`.

### Key files

- `frontend/src/api/strapi.js` — Axios instance; hardcoded invalid API token breaks auth flow (see above).
- `backend/.env.example` — Template for backend environment variables.
- `frontend/.env` — Frontend env pointing to `http://localhost:1337`.
