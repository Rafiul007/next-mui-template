/// <reference types="cypress" />

import type { RoleCredential } from "../support/commands";

// A unique sidebar label per landing dashboard. Each string appears on exactly
// one role's dashboard, so asserting it proves the *right* console rendered —
// not just that the URL changed. Add a teacher entry here when that role is set up.
const DASHBOARD_MARKER: Record<string, string> = {
  bongo: "Subscription Plans", // /bongo/dashboard only
  tenant: "Profile Setup", // /dashboard (center admin) only
  student: "My Schedule", // /student/dashboard only
};

// Roles run are whatever is present in cypress.env.json -> users. Add a teacher
// entry there (and a marker above) and it joins the matrix automatically.
describe("Role-based login", () => {
  const users = Cypress.env("users") as Record<string, RoleCredential>;
  const roles = Object.keys(users ?? {});

  it("has credentials configured", () => {
    expect(roles, "roles in cypress.env.json").to.have.length.greaterThan(0);
  });

  roles.forEach((role) => {
    const { home } = users[role];
    const marker = DASHBOARD_MARKER[role];

    describe(`${role}`, () => {
      it(`lands on ${home} and renders its dashboard`, () => {
        cy.loginByRole(role);
        cy.visit(home);
        // Stays put — not bounced to /login or another role's dashboard.
        cy.location("pathname").should("eq", home);
        // The correct dashboard actually rendered.
        if (marker) {
          cy.contains(marker).should("be.visible");
        }
      });

      it("is rejected from a foreign dashboard", () => {
        // Pick any other role's landing path to prove cross-role guards work.
        const foreignHome = roles
          .map((r) => users[r].home)
          .find((path) => path !== home);

        if (!foreignHome) {
          // Only one role configured — nothing to cross-check.
          return;
        }

        cy.loginByRole(role);
        cy.visit(foreignHome);
        // Guard must redirect away from a dashboard this role doesn't own.
        cy.location("pathname").should("not.eq", foreignHome);
      });
    });
  });

  it("sends an unauthenticated visitor to /login", () => {
    cy.clearCookies();
    cy.visit("/dashboard");
    cy.location("pathname").should("eq", "/login");
  });
});
