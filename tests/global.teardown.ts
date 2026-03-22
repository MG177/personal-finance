import { test as teardown } from "@playwright/test";

teardown("no-op teardown", async () => {
  // Intentionally empty — keeps seeded data for debugging.
  // In CI, the ephemeral DB is discarded automatically.
});
