/// <reference types="cypress" />

// Covers the four payroll-run adjustment capabilities NOT exercised by
// payroll-lifecycle.cy.ts (which only covers policy-resolved salary +
// overtime through approve -> disburse): per-employee salary customisation
// (overriding a designation policy) with a deduction, excluding an employee
// at run time, and manually adding an excluded/eligible employee back into a
// draft run. Run headed to watch it live:
//   npx cypress open
//
// Needs cypress.env.json with "tenant" user (see cypress/support/commands.ts)
// and both the backend and frontend running. Uses two existing demo
// employees under the same "Senior Teacher" designation policy (created by
// payroll-lifecycle.cy.ts, reused read-only here): "Test Faisal" (left on
// the plain designation policy, used for exclude/manual-add) and
// "Oda Sensei" (given a one-off custom SalaryStructure override here, used
// for the salary-customisation + deduction assertion).
//
// Traced from PayrollService before writing this:
//  - resolveSalaryStructure's precedence is per-employee SalaryStructure
//    override, then designation SalaryPolicy, then tenant default -- a
//    custom override completely replaces the policy's basic/allowances/
//    deductions, it doesn't merge with it. Test 3 confirms Oda Sensei's
//    override values land unchanged in the payroll entry.
//  - runPayroll's excludedEmployeeIds is a run-time-only skip -- it writes no
//    record marking the employee excluded, so an excluded employee is
//    functionally identical to one manually removed after the fact: both
//    just show up in getPayrollRunEligibleEmployees and can be re-added via
//    addEmployeeToPayrollRun, which resolves salary exactly like the
//    original run did (Test 3 exercises this for Test Faisal).
//  - addEmployeeToPayrollRun/removeEmployeeFromPayrollRun only work while the
//    run is DRAFT or REVIEWED (IllegalStateException otherwise) -- this spec
//    never approves/disburses the run it creates, staying in DRAFT
//    throughout, matching the "Manage employees" icon's own visibility guard
//    in PayrollWorkspace.tsx (isCancellable && (canApprove || canCancel)).
//  - The per-row action icons (Approve / Manage employees / Cancel /
//    Disburse) are IconButtons with no visible text -- Tooltip only adds
//    aria-describedby, not aria-label, so they can't be found by
//    cy.contains("button", "..."). For a fresh DRAFT run as the "tenant" role
//    (which payroll-lifecycle.cy.ts already established has both
//    HR_PAYROLL_RUN and HR_PAYROLL_APPROVE), the row's action buttons render
//    in a fixed order: Approve(0), Manage employees(1), Cancel(2) -- found by
//    position, same convention as the icon-only Approve/Reject buttons in
//    leave-management-lifecycle.cy.ts.

const EMPLOYEE_A_SEARCH = "Test Faisal"; // stays on the "Senior Teacher" designation policy
const EMPLOYEE_B_SEARCH = "Oda Sensei"; // gets a one-off custom override in Test 1

// A custom override distinct from the "Senior Teacher" policy's own values
// (basic 30000 / houseRent 10000 / medical 5000 / transport 3000 /
// deductions 1000, confirmed via direct DB read before writing this spec) --
// different numbers make it unambiguous which source a payroll entry pulled
// from.
const CUSTOM_SALARY = { basic: 45000, houseRent: 9000, medical: 4000, transport: 2500, deductions: 6000 };
const CUSTOM_ALLOWANCES = CUSTOM_SALARY.houseRent + CUSTOM_SALARY.medical + CUSTOM_SALARY.transport;

const POLICY_SALARY = { basic: 30000, houseRent: 10000, medical: 5000, transport: 3000, deductions: 1000 };
const POLICY_ALLOWANCES = POLICY_SALARY.houseRent + POLICY_SALARY.medical + POLICY_SALARY.transport;

// A future month/year that can't collide with a real prior run -- runPayroll
// hard-blocks a second run for the same tenant/month/year, so reruns of this
// spec need a fresh period every time, same convention as
// payroll-lifecycle.cy.ts's PAYROLL_YEAR.
const PAYROLL_MONTH = 6;
const PAYROLL_YEAR = new Date().getFullYear() + 200 + (Date.now() % 50_000);
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const PERIOD_TEXT = `${MONTH_NAMES[PAYROLL_MONTH - 1]} ${PAYROLL_YEAR}`;

const openDialog = () => cy.get('[role="dialog"]').filter(":visible").first();

const selectSearchOption = (label: string, typeText: string, optionText: string) => {
  cy.contains("label", label).parent().find("input").clear().type(typeText);
  cy.get('[role="option"]').contains(optionText).click();
};

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

describe("Payroll adjustments — salary customisation, deduction, exclusion, manual add", () => {
  it("admin: setting a custom salary structure overrides the designation policy, deduction included", () => {
    cy.loginByRole("tenant");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "SetSalaryStructure") req.alias = "setSalaryStructure";
    });
    cy.visit("/hr/dashboard/payroll");
    cy.contains('[role="tab"]', "Salary structures").click();

    selectSearchOption("Select employee", EMPLOYEE_B_SEARCH, EMPLOYEE_B_SEARCH);
    cy.contains("button", /set salary|update salary/i).click();

    openDialog().within(() => {
      typeFieldReliably(() => cy.contains("label", "Basic salary (৳) *").parent().find("input"), String(CUSTOM_SALARY.basic));
      typeFieldReliably(() => cy.contains("label", "House rent (৳)").parent().find("input"), String(CUSTOM_SALARY.houseRent));
      typeFieldReliably(() => cy.contains("label", "Medical (৳)").parent().find("input"), String(CUSTOM_SALARY.medical));
      typeFieldReliably(() => cy.contains("label", "Transport (৳)").parent().find("input"), String(CUSTOM_SALARY.transport));
      typeFieldReliably(() => cy.contains("label", "Deductions (৳)").parent().find("input"), String(CUSTOM_SALARY.deductions));
      cy.contains("button", "Save").click();
    });
    cy.wait("@setSalaryStructure");

    cy.contains("Current salary structure").should("exist");
    cy.contains(`৳ ${CUSTOM_SALARY.basic.toLocaleString()}`).should("exist");
    cy.contains(`৳ ${CUSTOM_SALARY.deductions.toLocaleString()}`).should("exist");
  });

  it("admin: running payroll with an excluded employee leaves them out of the run", () => {
    cy.loginByRole("tenant");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "RunPayroll") req.alias = "runPayroll";
    });
    cy.visit("/hr/dashboard/payroll");

    cy.contains("button", "Run payroll").click();
    openDialog().within(() => {
      cy.contains("label", "Month").parent().find('[role="combobox"]').click();
    });
    cy.get('[role="option"]').contains(MONTH_NAMES[PAYROLL_MONTH - 1]).click();
    openDialog().within(() => {
      cy.contains("label", "Year").parent().find("input").clear().type(String(PAYROLL_YEAR));
      // Exclude-employees Autocomplete also portals its option list to
      // document.body -- can't chain the option click inside this .within().
      // The label itself has pointer-events: none (MUI shrinks/animates it),
      // so click the input, not the label.
      cy.contains("label", "Exclude employees from this run").parent().find("input").click().type(EMPLOYEE_A_SEARCH);
    });
    cy.get('[role="option"]').contains(EMPLOYEE_A_SEARCH).click();
    // The option list stays open over the dialog's footer buttons after
    // picking a value -- close it before trying to click Run payroll.
    cy.get("body").type("{esc}");
    openDialog().within(() => {
      cy.contains(`excluding 1 selected`).should("exist");
      cy.contains("button", "Run payroll").click();
    });
    cy.wait("@runPayroll");

    cy.contains("tr", PERIOD_TEXT).should("exist");
  });

  it("admin: opening Manage employees shows the excluded employee as eligible, not included", () => {
    cy.loginByRole("tenant");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "GetPayrollRunEntries") req.alias = "getEntries";
      if (req.body?.operationName === "GetPayrollRunEligibleEmployees") req.alias = "getEligible";
    });
    cy.visit("/hr/dashboard/payroll");

    cy.contains("tr", PERIOD_TEXT).scrollIntoView().find("button").eq(1).click({ force: true }); // Manage employees
    cy.wait("@getEntries");
    cy.wait("@getEligible");

    // Scoped to the "Included" list specifically, not the whole dialog --
    // the excluded employee legitimately appears elsewhere in the same
    // dialog, under "Eligible to add".
    openDialog().within(() => {
      cy.contains("Included").parent().should("contain", EMPLOYEE_B_SEARCH); // included, custom override survived the run
      cy.contains("Included").parent().should("not.contain", EMPLOYEE_A_SEARCH); // excluded at run time
    });

    cy.get('[role="dialog"]').filter(":visible").within(() => {
      cy.contains("button", "Close").click();
    });

    // Re-open and check the Eligible-to-add list from a fresh fetch, not the
    // stale one captured above -- confirms the excluded employee genuinely
    // has no entry row rather than one hidden by a rendering quirk.
    cy.contains("tr", PERIOD_TEXT).scrollIntoView().find("button").eq(1).click({ force: true });
    cy.wait("@getEligible").then((interception) => {
      const eligible = interception.response?.body?.data?.getPayrollRunEligibleEmployees ?? [];
      expect(eligible.length, "eligible employee count").to.be.greaterThan(0);
    });
    openDialog().within(() => {
      cy.contains("Eligible to add").parent().should("contain", EMPLOYEE_A_SEARCH);
    });
  });

  it("admin: manually adding the excluded employee back resolves their designation-policy salary", () => {
    cy.loginByRole("tenant");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "AddEmployeeToPayrollRun") req.alias = "addEmployee";
      if (req.body?.operationName === "GetPayrollRunEntries") req.alias = "getEntries";
    });
    cy.visit("/hr/dashboard/payroll");
    cy.contains("tr", PERIOD_TEXT).scrollIntoView().find("button").eq(1).click({ force: true });
    cy.wait("@getEntries");

    openDialog().within(() => {
      cy.contains("li", EMPLOYEE_A_SEARCH).find("button").click();
    });
    cy.wait("@addEmployee");
    cy.wait("@getEntries").then((interception) => {
      const entries = interception.response?.body?.data?.getPayrollRunEntries ?? [];
      expect(entries.length, "entries after manual add").to.be.greaterThan(0);

      const testFaisalEntry = entries.find(
        (e: { basicSalary: number }) => e.basicSalary === POLICY_SALARY.basic,
      );
      expect(testFaisalEntry, "Test Faisal's entry, resolved from the Senior Teacher policy").to.be.an("object");
      expect(testFaisalEntry.allowances).to.eq(POLICY_ALLOWANCES);
      expect(testFaisalEntry.deductions).to.eq(POLICY_SALARY.deductions);

      const odaSenseiEntry = entries.find(
        (e: { basicSalary: number }) => e.basicSalary === CUSTOM_SALARY.basic,
      );
      expect(odaSenseiEntry, "Oda Sensei's entry, from her custom override").to.be.an("object");
      expect(odaSenseiEntry.allowances).to.eq(CUSTOM_ALLOWANCES);
      expect(odaSenseiEntry.deductions).to.eq(CUSTOM_SALARY.deductions);
    });

    // This tenant's other active employees with a resolvable salary also
    // land in the run (runPayroll isn't scoped to just these two demo
    // employees), so assert Test Faisal is now present rather than an exact
    // total headcount.
    openDialog().within(() => {
      cy.contains("Included").parent().should("contain", EMPLOYEE_A_SEARCH);
    });
  });
});
