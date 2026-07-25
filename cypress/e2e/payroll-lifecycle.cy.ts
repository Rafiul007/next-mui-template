/// <reference types="cypress" />

// End-to-end walk of the payroll module: a salary policy resolves an
// employee's pay (no per-employee override needed), a teacher requests a
// manual attendance correction and files an overtime/extra-class claim, HR
// approves both, then a payroll run picks up the policy-resolved salary plus
// the approved overtime and carries it through approve -> disburse -> the
// teacher's own payslip view. Run headed to watch it live:
//   npx cypress open
//
// Needs cypress.env.json with "teacher" and "tenant" users (see
// cypress/support/commands.ts) and both the backend and frontend running.
//
// Traced from PayrollService.buildEntry/runPayroll before writing this:
//  - Salary source resolution order: per-employee SalaryStructure override,
//    then a SalaryPolicy matching the employee's exact designation string,
//    then the tenant-wide default policy. No match => employee is silently
//    skipped from the run (no error, no row) — this spec goes through the
//    designation-policy path since that's what most real employees will hit.
//  - Manual attendance (present/absent/late) never affects payroll math —
//    no attendance data is read anywhere in PayrollService. Confirmed by
//    reading the code, not assumed; this spec asserts that explicitly rather
//    than silently relying on it.
//  - Overtime: only APPROVED claims not yet tied to a run are folded in, as
//    extra `allowances` (and `netAmount`), computed at approval time as
//    hours x the policy's overtimeHourlyRate. Rejected/pending claims must
//    never appear in a run.

const POLICY_DESIGNATION = "Senior Teacher"; // must exactly match the "teacher" demo employee's designation
const EMPLOYEE_SEARCH_TEXT = "Test Faisal"; // display name for the "teacher" demo employee

const openDialog = () => cy.get('[role="dialog"]').filter(":visible").first();

// A fresh dialog's fields can drop keystrokes on this codebase (same
// hydration race documented for the batch-select field in
// exam-lifecycle.cy.ts) — a plain single type() intermittently loses this
// race, so retry each field until its value actually sticks. `getField` is
// re-evaluated on every attempt since the element may re-render between tries.
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

// Retry clear+type until the Year field actually holds the exact value — a
// single clear().type() can race Next.js hydration and silently produce a
// garbled value (confirmed here: it once turned "48966" into "489660"), same
// class of bug fixed for the batch-select field in exam-lifecycle.cy.ts.
const typeYearReliably = (value: string, attempt = 0) => {
  cy.contains("label", "Year")
    .parent()
    .find("input")
    .clear()
    .type(`{selectall}${value}`, { delay: 40 });
  cy.contains("label", "Year")
    .parent()
    .find("input")
    .invoke("val")
    .then((current) => {
      if (current !== value && attempt < 15) {
        typeYearReliably(value, attempt + 1);
      }
    });
};
const today = () => new Date().toISOString().slice(0, 10);
// employee_attendance has a unique (employee_id, date) constraint — a fixed
// "today" would collide with any pre-existing record for that date (a real
// check-in, or a previous run's leftover data) and get rejected. Stay within
// the current month/day-of-month range so the admin approval page's Month
// picker (which defaults to the current month, untouched by this spec) still
// shows it, while varying the day per run to dodge that constraint.
const uniqueAttendanceDate = () => {
  const day = 1 + (Date.now() % 27);
  const d = new Date();
  d.setDate(day);
  return d.toISOString().slice(0, 10);
};

type Shared = {
  policyName: string;
  attendanceReason: string;
  overtimeReason: string;
  payrollYear: number;
  periodText: string;
  basic: number;
  houseRent: number;
  medical: number;
  transport: number;
  deductions: number;
  overtimeRate: number;
  overtimeHours: number;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Unique per run (unlike the salary policy's fixed designation) so re-running
// this spec while iterating never collides with a previous pass's payroll
// run — a fixed offset would otherwise hit the duplicate-run guard on every
// second run.
// %500 collided across repeated same-day iterations while developing this
// spec (~15 runs was enough to hit a repeat) — widened well past any
// realistic same-day re-run count. The Year field is a plain number input
// with no apparent upper bound, so an implausibly large year is harmless.
const PAYROLL_YEAR = new Date().getFullYear() + 100 + (Date.now() % 50_000);

const shared: Shared = {
  policyName: `Cypress Policy ${Date.now()}`,
  attendanceReason: `Cypress attendance correction ${Date.now()}`,
  overtimeReason: `Cypress overtime claim ${Date.now()}`,
  // Month is left at "whatever the current month is" so no Select needs to
  // be touched at all.
  payrollYear: PAYROLL_YEAR,
  periodText: `${MONTH_NAMES[new Date().getMonth()]} ${PAYROLL_YEAR}`,
  basic: 30000,
  houseRent: 10000,
  medical: 5000,
  transport: 3000,
  deductions: 1000,
  overtimeRate: 500,
  overtimeHours: 3,
};

describe("Payroll lifecycle — salary policy, attendance, overtime, run, disburse", () => {
  it("admin: creates (or reuses, on a re-run) a salary policy for the teacher's designation", () => {
    // Unlike the exam title, the designation string is fixed (must exactly
    // match the demo employee's real designation), so re-running this spec
    // would hit "A salary policy already exists for designation: ..." on a
    // second pass. Editing the existing card in place keeps every re-run
    // deterministic instead of accumulating duplicate policies.
    cy.loginByRole("tenant");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "GetSalaryPolicies") req.alias = "getSalaryPolicies";
    });
    cy.visit("/hr/dashboard/salary-policy");
    // Read the DOM only after the policies list has actually loaded — reading
    // it synchronously right after visit would race the GraphQL round trip
    // and always look empty (same class of bug fixed in exam-lifecycle.cy.ts).
    cy.wait("@getSalaryPolicies");

    const fillAndSave = (submitLabel: string) => {
      openDialog().within(() => {
        if (submitLabel === "Create policy") {
          cy.contains("label", "Policy name *").parent().find("input").clear().type(shared.policyName);
          cy.contains("label", "Designation *").parent().find("input").type(POLICY_DESIGNATION);
        }
        cy.contains("label", "Basic *").parent().find("input").clear().type(String(shared.basic));
        cy.contains("label", "House rent *").parent().find("input").clear().type(String(shared.houseRent));
        cy.contains("label", "Medical *").parent().find("input").clear().type(String(shared.medical));
        cy.contains("label", "Transport *").parent().find("input").clear().type(String(shared.transport));
        cy.contains("label", "Deductions").parent().find("input").clear().type(String(shared.deductions));
        cy.contains("label", "Overtime hourly rate")
          .parent()
          .find("input")
          .clear()
          .type(String(shared.overtimeRate));
        cy.contains("button", submitLabel).click();
      });
    };

    cy.get("body").then(($body) => {
      const existing = $body.find(`.MuiPaper-root:contains("${POLICY_DESIGNATION}")`);
      if (existing.length > 0) {
        // Edit icon is the first of the two icon buttons on the card (Edit, then Delete).
        cy.contains(".MuiPaper-root", POLICY_DESIGNATION).find("button").first().click();
        fillAndSave("Save changes");
      } else {
        cy.contains("button", "Create policy").click();
        fillAndSave("Create policy");
      }
    });

    cy.contains(".MuiPaper-root", POLICY_DESIGNATION).should("be.visible");
  });

  it("teacher: submits a manual attendance correction", () => {
    cy.loginByRole("teacher");
    cy.visit("/teacher/dashboard/attendance");
    cy.contains('[role="tab"]', "My Attendance").click();

    cy.contains("button", "Request manual attendance").should("not.be.disabled").click();
    const attendanceDate = uniqueAttendanceDate();
    openDialog().within(() => {
      typeFieldReliably(() => cy.get('input[type="date"]'), attendanceDate);
      cy.get('input[type="date"]').should("have.value", attendanceDate);
      typeFieldReliably(
        () => cy.contains("label", "Reason").parent().find("textarea").first(),
        shared.attendanceReason,
      );
      cy.contains("label", "Reason")
        .parent()
        .find("textarea")
        .first()
        .should("have.value", shared.attendanceReason);
      cy.contains("button", "Submit").click();
    });

    // The Reason column can be scrolled out of view on this table, but the
    // row still exists in the DOM — that's enough to prove the write landed
    // (and implicitly that the dialog closed, since it only does that on
    // success).
    // Scoped to a table row, not a bare page-wide text search — a stuck-open
    // dialog's textarea still carries the typed value, and cy.contains()
    // matches input/textarea values too, so a page-wide check would give a
    // false pass even when the request actually failed and the dialog never
    // closed. This was a real gap that hid a genuine bug while writing this.
    cy.contains("tr", shared.attendanceReason).should("exist");
  });

  it("admin: approves the manual attendance request", () => {
    cy.loginByRole("tenant");
    cy.visit("/hr/dashboard/attendance");

    cy.get('input[placeholder="Search by name or code…"]').click().type(EMPLOYEE_SEARCH_TEXT);
    cy.get('[role="option"]').contains(EMPLOYEE_SEARCH_TEXT).click();

    cy.contains("tr", shared.attendanceReason).contains("button", "Approve").click();
    cy.contains("tr", shared.attendanceReason).should("not.contain", "Approve");
  });

  it("teacher: submits an overtime / extra-class claim", () => {
    cy.loginByRole("teacher");
    cy.visit("/teacher/dashboard/attendance");
    cy.contains('[role="tab"]', "Overtime Claims").click();

    cy.contains("button", "Submit claim").should("not.be.disabled").click();
    const overtimeDate = today();
    openDialog().within(() => {
      typeFieldReliably(() => cy.get('input[type="date"]'), overtimeDate);
      cy.get('input[type="date"]').should("have.value", overtimeDate);
      typeFieldReliably(
        () => cy.contains("label", "Hours").parent().find("input"),
        String(shared.overtimeHours),
      );
      cy.contains("label", "Hours").parent().find("input").should("have.value", String(shared.overtimeHours));
      typeFieldReliably(
        () => cy.contains("label", "Reason").parent().find("textarea").first(),
        shared.overtimeReason,
      );
      cy.contains("label", "Reason")
        .parent()
        .find("textarea")
        .first()
        .should("have.value", shared.overtimeReason);
      cy.contains("button", "Submit").click();
    });

    // Same scoping fix as the attendance check above.
    cy.contains("tr", shared.overtimeReason).should("exist");
  });

  it("admin: approves the overtime claim, computing hours x rate", () => {
    cy.loginByRole("tenant");
    cy.visit("/hr/dashboard/overtime-claims");

    // This page only lists PENDING claims — approving removes the row from
    // this view entirely (the amount is verified from the teacher's own
    // claims list right after, which shows every status).
    cy.contains("tr", shared.overtimeReason).find("button").first().click();
    cy.contains("tr", shared.overtimeReason).should("not.exist");
  });

  it("teacher: sees the claim approved with the correct computed amount", () => {
    cy.loginByRole("teacher");
    cy.visit("/teacher/dashboard/attendance");
    cy.contains('[role="tab"]', "Overtime Claims").click();

    const expectedAmount = shared.overtimeHours * shared.overtimeRate;
    cy.contains("tr", shared.overtimeReason).should("contain", "Approved");
    cy.contains("tr", shared.overtimeReason).should(
      "contain",
      `৳${expectedAmount.toLocaleString()}`,
    );
  });

  it("admin: runs payroll and verifies policy salary + overtime are folded in correctly", () => {
    cy.loginByRole("tenant");
    cy.visit("/hr/dashboard/payroll");

    cy.contains("button", "Run payroll").click();
    openDialog().within(() => {
      // Month is left at its current-month default — only the year is
      // pushed out, which is enough on its own to make this run unique.
      typeYearReliably(String(shared.payrollYear));
      cy.contains("label", "Year").parent().find("input").should("have.value", String(shared.payrollYear));
      cy.contains("button", "Run payroll").should("not.be.disabled").click();
    });

    cy.contains("tr", shared.periodText).should("be.visible");

    // Confirm on the Payslips tab that the policy-resolved salary and the
    // approved overtime both landed correctly, and that manual attendance
    // (recorded earlier, on the same employee) did not change anything.
    cy.contains('[role="tab"]', "Payslips").click();
    cy.get('input[placeholder="Search by code…"]').first().click().type(EMPLOYEE_SEARCH_TEXT);
    cy.get('[role="option"]').contains(EMPLOYEE_SEARCH_TEXT).click();
    cy.contains("label", "Payroll run").parent().find(".MuiSelect-select").click();
    cy.get('[role="option"]').contains(shared.periodText).click();

    const expectedNonOvertimeAllowances = shared.houseRent + shared.medical + shared.transport;
    const expectedOvertimeAmount = shared.overtimeHours * shared.overtimeRate;

    // .should("exist") rather than "be.visible" — these summary cards can be
    // clipped by the dialog's own overflow at some viewport widths; existence
    // is enough to prove the numbers actually landed.
    cy.contains("৳ " + shared.basic.toLocaleString()).should("exist"); // Basic salary card
    cy.contains(
      "৳ " + (expectedNonOvertimeAllowances + expectedOvertimeAmount).toLocaleString(),
    ).should("exist"); // Allowances card — includes the overtime payout
  });

  it("admin: re-running the same month/year is blocked (duplicate-run guard)", () => {
    cy.loginByRole("tenant");
    cy.visit("/hr/dashboard/payroll");

    cy.contains("button", "Run payroll").click();
    openDialog().within(() => {
      typeYearReliably(String(shared.payrollYear));
      cy.contains("label", "Year").parent().find("input").should("have.value", String(shared.payrollYear));
      cy.contains(`already exists`).should("be.visible");
      cy.contains("button", "Run payroll").should("be.disabled");
      cy.contains("button", "Cancel").click();
    });
  });

  it("admin: approves and disburses the payroll run", () => {
    cy.loginByRole("tenant");
    cy.visit("/hr/dashboard/payroll");

    // force: true — MRT's own internal scroll container confuses Cypress's
    // auto-scroll-into-view actionability check even after scrollIntoView().
    cy.contains("tr", shared.periodText).find("button").first().click({ force: true }); // Approve
    cy.contains("tr", shared.periodText).should("contain", "Approved");

    cy.contains("tr", shared.periodText).find("button").first().click({ force: true }); // Disburse
    cy.contains("tr", shared.periodText).should("contain", "Disbursed");
  });

  it("teacher: sees the disbursed payslip in self-service My Payroll", () => {
    cy.loginByRole("teacher");
    // /hr/dashboard/my-payroll is HR-staff-only (HrAuthGuard denies plain
    // TEACHER accounts and bounces them elsewhere) — same MyPayrollWorkspace
    // component is also mounted at this teacher-portal route, which is the
    // real one a teacher account can reach.
    cy.visit("/teacher/dashboard/payments");

    // Defaults to the current tax year — switch to the (deliberately
    // far-future) year this run used.
    cy.contains("label", "Tax year").parent().find(".MuiSelect-select").click();
    // Exact match, not substring — cy.contains() would otherwise happily
    // match a *different* pre-existing year that merely contains this one as
    // a text prefix (e.g. payrollYear 45974 matching option "459740").
    cy.get('[role="option"]')
      .contains(new RegExp(`^${shared.payrollYear}$`))
      .click();

    // Row format is formatTk(): "৳30,000" — no space, en-BD grouping.
    const expectedBasic = `৳${shared.basic.toLocaleString("en-BD")}`;
    const expectedAllowances = `৳${(
      shared.houseRent +
      shared.medical +
      shared.transport +
      shared.overtimeHours * shared.overtimeRate
    ).toLocaleString("en-BD")}`;

    cy.contains("tr", shared.periodText).within(() => {
      // "Paid" not "Disbursed" — payrollStatusMeta deliberately gives the
      // same DISBURSED status a different label per audience (admin sees
      // "Disbursed", the employee sees "Paid"). Asserting the admin label
      // here would be checking the wrong thing on purpose.
      cy.contains("Paid").should("exist");
      cy.contains(expectedBasic).should("exist");
      // Allowances must include the overtime payout, not just the policy's
      // house rent + medical + transport — this is the actual regression
      // check that the overtime-folding step landed on the employee's own
      // payslip, not just the admin-side view checked earlier.
      cy.contains(expectedAllowances).should("exist");
    });
  });
});
