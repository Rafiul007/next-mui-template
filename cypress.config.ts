import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // App must be running (yarn dev) before the suite. Override with
    // CYPRESS_BASE_URL when pointing at a deployed environment.
    baseUrl: process.env.CYPRESS_BASE_URL ?? "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
    video: false,
  },
});
