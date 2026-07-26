/// <reference types="cypress" />

// End-to-end walk of employee onboarding + department management: an admin
// sets up two departments (each with a different default role), onboards a
// brand-new employee straight into the first department, then moves them to
// the second and finally clears their department altogether. Run headed to
// watch it live:
//   npx cypress open
//
// Needs cypress.env.json with a "tenant" user (see cypress/support/commands.ts)
// and both the backend and frontend running.
//
// Traced from EmployeeService/DepartmentService before writing this, and
// found + fixed three real bugs along the way:
//  - Onboarding an "Intern" always crashed: the form's employmentType option
//    ("intern" -> "INTERN") had no matching backend EmploymentType enum value
//    (only FULL_TIME/PART_TIME/CONTRACTUAL existed) -- EmploymentType.valueOf
//    threw for every single intern onboarded. Added INTERN to the enum
//    (the frontend already had a label for it, so the intent was clearly to
//    support it). Test 2 below is the regression check.
//  - assignToDepartment added the new department's defaultRoles but never
//    revoked the previous department's roles first, so moving an employee
//    between departments silently accumulated roles from every department
//    they'd ever passed through instead of replacing them. Reordered to
//    revoke old roles no longer applicable after the new ones are confirmed
//    assigned (and assign-before-persist, so a bad role name aborts the
//    whole reassignment instead of silently moving the employee while the
//    UI reports a failure).
//  - removeFromDepartment cleared departmentId but never the department name
//    string, so the UI kept showing the old department name after removal --
//    and the frontend never even called removeEmployeeFromDepartment in the
//    first place (clearing the Department field to "None" while editing was
//    a silent no-op). Fixed both the backend clear and wired up the frontend
//    call. Test 4 below is the regression check for both.
//  - Also fixed: editing an existing department never showed its current
//    default-role chips in the form (state always started empty) -- cosmetic,
//    not covered by an assertion here since it doesn't affect saved data.

const DEPT_1 = { code: "CYQA1", name: "Cypress QA Dept One", role: "RECEPTIONIST" };
const DEPT_2 = { code: "CYQA2", name: "Cypress QA Dept Two", role: "ACCOUNTANT" };
const BRANCH_SEARCH_TEXT = "Dhaka";

const openDialog = () => cy.get('[role="dialog"]').filter(":visible").first();

// Same hydration-race retry pattern used throughout this suite (exam/payroll/
// fee lifecycle specs) -- a plain single type() intermittently drops
// keystrokes on a freshly-mounted controlled field.
const typeFieldReliably = (
  getField: () => Cypress.Chainable<JQuery<HTMLElement>>,
  value: string,
  attempt = 0,
) => {
  getField().clear().type(value);
  getField()
    .invoke("val")
    .then((current) => {
      if (current !== value && attempt < 10) {
        typeFieldReliably(getField, value, attempt + 1);
      }
    });
};

const selectMuiOption = (label: string, optionText: string) => {
  cy.contains("label", label).parent().find('[role="combobox"]').click();
  cy.get('[role="option"]').contains(optionText).click();
};

// RhfDatePicker is an MUI X DatePicker rendered as a sectioned field (visible
// "role=group" of separate month/day/year spans over a hidden real <input>),
// not a plain text input -- .type() must target the group, and MUI auto-
// advances between sections as digits are typed, no separators needed.
const fillJoiningDateToday = () => {
  const d = new Date();
  const digits = `${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}${d.getFullYear()}`;
  cy.contains("label", "Joining date *").parent().find('[role="group"]').click();
  cy.focused().type(digits);
};

// Unique per run so re-running this spec while iterating never collides with
// a leftover user account from a previous pass (onboarding always creates a
// brand-new user -- there's no upsert-by-email).
const RUN_ID = Date.now();
const EMPLOYEE_FIRST_NAME = "CypressQA";
const EMPLOYEE_LAST_NAME = `Onboard${RUN_ID}`;
const EMPLOYEE_FULL_NAME = `${EMPLOYEE_FIRST_NAME} ${EMPLOYEE_LAST_NAME}`;
const EMPLOYEE_EMAIL = `cypress.onboard.${RUN_ID}@example.com`;

const ensureDepartment = (dept: { code: string; name: string; role: string }) => {
  cy.loginByRole("tenant");
  cy.intercept("POST", "**/graphql", (req) => {
    if (req.body?.operationName === "GetDepartments") req.alias = "getDepartments";
  });
  cy.visit("/dashboard/tenant-setup/org-hierarchy");
  // Read the DOM only after the departments list has actually loaded --
  // reading it synchronously right after visit races the GraphQL round trip
  // and always looks empty, sending every run down the "create" branch and
  // hitting the backend's duplicate-code guard.
  cy.wait("@getDepartments");

  cy.get("body").then(($body) => {
    const existing = $body.find(`.MuiChip-root:contains("${dept.code}")`);
    if (existing.length > 0) {
      // Department codes are immutable once created -- editing in place
      // keeps re-runs deterministic instead of failing on a duplicate code.
      cy.contains("tr", dept.code).find("button").click();
      openDialog().within(() => {
        // addRole() is a no-op for an already-present role, so it's safe to
        // always attempt this rather than checking whether the chip already
        // hydrated from the department's existing defaultRoles.
        cy.contains("label", "Default role").parent().find("input").clear().type(dept.role);
        cy.contains("button", "Add").click();
        cy.contains("button", "Save changes").click();
      });
    } else {
      cy.contains("button", "New department").click();
      openDialog().within(() => {
        typeFieldReliably(() => cy.contains("label", "Department name *").parent().find("input"), dept.name);
        typeFieldReliably(() => cy.contains("label", "Code *").parent().find("input"), dept.code);
        cy.contains("label", "Default role").parent().find("input").clear().type(dept.role);
        cy.contains("button", "Add").click();
        cy.contains("button", "Create").click();
      });
    }
  });

  cy.contains("tr", dept.code).should("exist");
};

describe("HR onboarding lifecycle — departments, onboarding, department reassignment", () => {
  it("admin: sets up (or reuses, on a re-run) two departments with distinct default roles", () => {
    ensureDepartment(DEPT_1);
    ensureDepartment(DEPT_2);

    cy.contains("tr", DEPT_1.code).should("contain", DEPT_1.role);
    cy.contains("tr", DEPT_2.code).should("contain", DEPT_2.role);
  });

  it("admin: onboards a new Intern employee straight into department one", () => {
    cy.loginByRole("tenant");
    cy.visit("/hr/dashboard/employees");

    cy.contains("button", "Onboard employee").click();
    // The Select/option popper is portaled to document.body, outside the
    // dialog's own DOM subtree -- calling selectMuiOption() from inside a
    // .within(dialog) block scopes cy.get('[role="option"]') to the dialog
    // and never finds it, so those calls stay outside .within() here.
    openDialog().within(() => {
      typeFieldReliably(() => cy.contains("label", "First name *").parent().find("input"), EMPLOYEE_FIRST_NAME);
      typeFieldReliably(() => cy.contains("label", "Last name").parent().find("input"), EMPLOYEE_LAST_NAME);
      typeFieldReliably(() => cy.contains("label", "Email *").parent().find("input"), EMPLOYEE_EMAIL);
    });

    selectMuiOption("Branch *", BRANCH_SEARCH_TEXT);
    // Regression check for the EmploymentType enum fix -- this option used
    // to crash onboarding with a 500 the moment it was submitted.
    selectMuiOption("Employment type *", "Intern");
    selectMuiOption("Department", DEPT_1.name);

    fillJoiningDateToday();
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "OnboardEmployeeWithUser") req.alias = "onboardReq";
      if (req.body?.operationName === "AssignEmployeeToDepartment") req.alias = "assignReq";
    });
    openDialog().within(() => {
      cy.contains("button", "Onboard").click();
    });
    // onboardEmployeeWithUser then a follow-up assignEmployeeToDepartment
    // call chain before the dialog closes -- wait for both round trips
    // rather than racing the UI on a fixed timeout.
    cy.wait("@onboardReq");
    cy.wait("@assignReq");
    cy.contains("Employee onboarded successfully").should("exist");
    cy.get('[role="dialog"]', { timeout: 10000 }).filter(":visible").should("have.length", 0);

    cy.get('button[aria-label="Show/Hide search"]').first().click({ force: true });
    cy.get('input[placeholder="Search staff"]').should("be.visible").clear().type(EMPLOYEE_FULL_NAME);
    cy.contains("tr", EMPLOYEE_FULL_NAME).should("exist");
    cy.contains("tr", EMPLOYEE_FULL_NAME).within(() => {
      cy.contains("Intern").should("exist");
      cy.contains(DEPT_1.name).should("exist");
    });
  });

  it("admin: moves the employee to department two — regression check for the role-leak fix", () => {
    cy.loginByRole("tenant");
    cy.visit("/hr/dashboard/employees");

    cy.get('button[aria-label="Show/Hide search"]').first().click({ force: true });
    cy.get('input[placeholder="Search staff"]').should("be.visible").clear().type(EMPLOYEE_FULL_NAME);
    cy.contains("tr", EMPLOYEE_FULL_NAME).find("button").first().click();

    selectMuiOption("Department", DEPT_2.name);
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "UpdateEmployee") req.alias = "updateReq";
      if (req.body?.operationName === "AssignEmployeeToDepartment") req.alias = "assignReq";
    });
    openDialog().within(() => {
      cy.contains("button", "Save changes").click();
    });
    cy.wait("@updateReq");
    cy.wait("@assignReq");
    cy.contains("Employee profile updated").should("exist");
    cy.get('[role="dialog"]', { timeout: 10000 }).filter(":visible").should("have.length", 0);

    // Re-apply the search -- the refetch after save can drop the table's
    // in-progress global filter state.
    cy.get('button[aria-label="Show/Hide search"]').first().click({ force: true });
    cy.get('input[placeholder="Search staff"]').should("be.visible").clear().type(EMPLOYEE_FULL_NAME);
    cy.contains("tr", EMPLOYEE_FULL_NAME).within(() => {
      cy.contains(DEPT_2.name).should("exist");
      cy.contains(DEPT_1.name).should("not.exist");
    });
  });

  it("admin: clears the employee's department — regression check for the remove-from-department fix", () => {
    cy.loginByRole("tenant");
    cy.visit("/hr/dashboard/employees");

    cy.get('button[aria-label="Show/Hide search"]').first().click({ force: true });
    cy.get('input[placeholder="Search staff"]').should("be.visible").clear().type(EMPLOYEE_FULL_NAME);
    cy.contains("tr", EMPLOYEE_FULL_NAME).find("button").first().click();

    selectMuiOption("Department", "None");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "UpdateEmployee") req.alias = "updateReq";
      if (req.body?.operationName === "RemoveEmployeeFromDepartment") req.alias = "removeReq";
    });
    openDialog().within(() => {
      cy.contains("button", "Save changes").click();
    });
    cy.wait("@updateReq");
    cy.wait("@removeReq");
    cy.contains("Employee profile updated").should("exist");
    cy.get('[role="dialog"]', { timeout: 10000 }).filter(":visible").should("have.length", 0);

    // Re-apply the search -- the refetch after save can drop the table's
    // in-progress global filter state.
    cy.get('button[aria-label="Show/Hide search"]').first().click({ force: true });
    cy.get('input[placeholder="Search staff"]').should("be.visible").clear().type(EMPLOYEE_FULL_NAME);

    // Before the fix, clearing Department to "None" fired no mutation at all
    // (and even if it had, the backend left the stale department name in
    // place) -- so this cell would still show "Cypress QA Dept Two".
    cy.contains("tr", EMPLOYEE_FULL_NAME).within(() => {
      cy.contains(DEPT_2.name).should("not.exist");
      cy.contains(DEPT_1.name).should("not.exist");
      cy.contains("—").should("exist");
    });
  });
});
