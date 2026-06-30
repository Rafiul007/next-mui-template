/// <reference types="cypress" />

export type RoleCredential = {
  email: string;
  password: string;
  home: string;
};

const getUser = (role: string): RoleCredential => {
  const users = Cypress.env("users") as Record<string, RoleCredential> | undefined;
  const user = users?.[role];
  if (!user) {
    throw new Error(
      `No credentials for role "${role}". Add it to cypress.env.json under "users".`,
    );
  }
  return user;
};

// Next.js dev hydration can swallow the first keystrokes typed into a freshly
// visited page (the static input exists before React attaches its onChange), so
// `cy.type` loses the start of the value. Re-type until the controlled input
// actually holds the full string instead of asserting against a half-filled field.
const typeReliably = (
  selector: string,
  value: string,
  options: Partial<Cypress.TypeOptions> = {},
  attempt = 0,
) => {
  cy.get(selector).should("be.visible").clear().type(value, options);
  cy.get(selector)
    .invoke("val")
    .then((current) => {
      if (current !== value && attempt < 5) {
        typeReliably(selector, value, options, attempt + 1);
      }
    });
};

// Logs in through the real /login form for a role and caches the resulting
// session (httpOnly cookies) so later tests reuse it instead of re-logging in.
Cypress.Commands.add("loginByRole", (role: string) => {
  const user = getUser(role);

  cy.session(
    role,
    () => {
      cy.visit("/login");
      typeReliably('input[autocomplete="email"]', user.email);
      typeReliably('input[autocomplete="current-password"]', user.password, {
        log: false,
      });
      // Guard: don't click submit until the form actually holds the email, so a
      // failure here reads as "wrong value" rather than a confusing redirect timeout.
      cy.get('input[autocomplete="email"]').should("have.value", user.email);
      cy.contains("button", "Sign in").click();
      // A correct login lands the role on its own dashboard.
      cy.location("pathname", { timeout: 15000 }).should("eq", user.home);
    },
    {
      validate() {
        // Re-using a cached session must keep a valid auth cookie.
        cy.getCookie("bongo.access-token").should("exist");
      },
    },
  );
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loginByRole(role: string): Chainable<void>;
    }
  }
}
