/// <reference types="cypress" />

// End-to-end walk of leave management: an admin creates a tenant-wide leave
// policy, initialises a teacher's leave balance from it, the teacher applies
// for leave through self-service, and the admin approves one request and
// rejects another. A third request is applied and then cancelled by the
// teacher themselves before any admin action. Run headed to watch it live:
//   npx cypress open
//
// Needs cypress.env.json with "tenant" and "teacher" users (see
// cypress/support/commands.ts) and both the backend and frontend running.
//
// Traced from LeaveService/LeaveBalanceInitService before writing this:
//  - applyLeave requires a LeaveBalance row to already exist for
//    (employeeId, year, leaveType) -- there is no lazy/implicit creation, so
//    initLeaveBalancesForEmployee must run first or the mutation throws
//    "Leave balance not found for employee".
//  - initLeaveBalancesForEmployee is idempotent per (employeeId, year,
//    leaveType): if a balance already exists it's silently skipped, so this
//    spec never asserts an absolute remaining-days count (repeat runs would
//    see whatever a prior run left behind) -- it reads the balance immediately
//    before each action and asserts the exact delta after.
//  - approveLeave decrements LeaveBalance.remaining; rejectLeave does NOT
//    touch the balance at all (rejecting a pending request never reserved
//    anything) -- Test 3 asserts the balance is untouched by a rejection.
//  - cancelLeave only restores the balance if the application being
//    cancelled was already APPROVED; cancelling a PENDING one is a pure
//    status flip with no balance side effect (nothing to restore) -- Test 4
//    asserts that too.
//
// Confirmed while reading the code but NOT exercised by any test here: an
// approved leave can never actually be cancelled through the UI. The
// backend's cancelLeave restores the balance for that case, but
// TeacherLeaveWorkspace.tsx only renders the Cancel button when
// status === "pending", and LeaveWorkspace.tsx's buildLeaveColumns wires an
// onCancel handler that no rendered button ever calls (only Approve/Reject
// for pending, "Find substitute" for approved). That balance-restore path is
// currently dead code from the UI's perspective -- flagging, not fixing,
// since this session's scope was narrowed to leave management as tested here.
//
// Also fixed two real case-sensitivity bugs in RecruitmentWorkspace.tsx
// while investigating the sibling recruitment-pipeline module before being
// redirected to leave management -- unrelated to this file, see git diff.

// "Maternity" chosen because it's one of only 5 leave types the frontend's
// hardcoded dropdowns expose -- 2 of the backend LeaveType enum's 7 values
// (PATERNITY, COMPENSATORY) can never be selected in either
// LeavePolicyWorkspace.tsx or TeacherLeaveWorkspace.tsx. Flagging, not fixing
// (narrowed scope), but confirmed by trying PATERNITY first and hitting a
// missing dropdown option.
const LEAVE_TYPE_VALUE = "maternity";
const LEAVE_TYPE_LABEL = "Maternity leave";
const POLICY_NAME = "Cypress Maternity Leave";
// Reject/cancel never decrement a balance, but applying still requires enough
// remaining days to pass the Submit-disable/exceedsBalance guard -- Maternity
// is reserved for the one test that actually consumes it (approve), since
// repeated spec runs already drove it near 0. Sick is untouched by those two
// tests' outcomes, so its balance never depletes across reruns.
const OTHER_LEAVE_TYPE_VALUE = "sick";
const OTHER_LEAVE_TYPE_LABEL = "Sick leave";
const OTHER_POLICY_NAME = "Cypress Sick Leave";
const EMPLOYEE_SEARCH_TEXT = "Test Faisal"; // display name for the "teacher" demo employee, reused from payroll-lifecycle.cy.ts

// Each test's applied leave gets a distinct reason string (with a run-scoped
// timestamp, since the offset dates below are fixed relative to "today" and
// would otherwise collide with whatever an earlier run left behind on the
// same calendar day) and is looked up by that reason specifically -- never by
// "first Pending row", which would grab a stale leftover instead of the row
// this run just created.
const RUN_ID = Date.now();
const APPROVE_REASON = `Cypress leave test -- approve flow ${RUN_ID}`;
const REJECT_REASON = `Cypress leave test -- reject flow ${RUN_ID}`;
const CANCEL_REASON = `Cypress leave test -- cancel flow ${RUN_ID}`;

const openDialog = () => cy.get('[role="dialog"]').filter(":visible").first();

// Same hydration-race retry pattern used throughout this suite (exam/payroll/
// onboarding specs) -- a fresh dialog's fields can drop keystrokes, so retry
// each field until its value actually sticks.
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

// Both leave tables default to a 10-row page size, and this employee has
// accumulated more than that across repeated spec runs (each run's rows are
// never deleted) -- widen the page so a target row can't be hiding on page 2.
const showAllRows = () => {
  cy.contains("Rows per page").parent().find('[role="combobox"]').click();
  cy.get('[role="option"]').last().click();
};

const selectMuiOption = (label: string, optionText: string) => {
  cy.contains("label", label).parent().find('[role="combobox"]').click();
  cy.get('[role="option"]').contains(optionText).click();
};

// SearchSelect (MUI Autocomplete) needs the option list open before it can be
// clicked -- typing the search text filters it down first, same as the
// batch-select fields documented in exam-lifecycle.cy.ts.
const selectSearchOption = (label: string, typeText: string, optionText: string) => {
  cy.contains("label", label).parent().find("input").clear().type(typeText);
  cy.get('[role="option"]').contains(optionText).click();
};

// Reuse a policy if a previous run of this spec already created one -- there's
// no delete mutation for leave policies, same situation as the salary-policy
// reuse documented in exam-lifecycle.cy.ts.
const ensurePolicy = (name: string, typeLabel: string) => {
  cy.get("body").then(($body) => {
    if ($body.text().includes(name)) {
      cy.contains(name).should("exist");
      return;
    }

    cy.contains("button", "Create policy").click();
    // selectMuiOption() must run outside .within() -- the Select's option
    // list portals to document.body, outside the dialog's own DOM subtree,
    // same gotcha documented in hr-onboarding-lifecycle.cy.ts.
    openDialog().within(() => {
      typeFieldReliably(() => cy.contains("label", "Policy name *").parent().find("input"), name);
    });
    selectMuiOption("Leave type *", typeLabel);
    openDialog().within(() => {
      typeFieldReliably(() => cy.contains("label", "Total days per year *").parent().find("input"), "12");
      typeFieldReliably(() => cy.contains("label", "Carry-forward days *").parent().find("input"), "0");
      cy.contains("button", "Create policy").click();
    });

    cy.contains(name).should("exist");
  });
};

describe("Leave management — policy, balance init, apply, approve, reject, cancel", () => {
  it("admin: creating tenant-wide leave policies for fresh leave types makes them usable", () => {
    cy.loginByRole("tenant");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "GetLeavePolicies") req.alias = "getLeavePolicies";
    });
    cy.visit("/hr/dashboard/leave-policy");
    cy.wait("@getLeavePolicies");

    ensurePolicy(POLICY_NAME, LEAVE_TYPE_LABEL);
    ensurePolicy(OTHER_POLICY_NAME, OTHER_LEAVE_TYPE_LABEL);
  });

  it("admin: initialising leave balances picks up the new policy for the teacher employee", () => {
    cy.loginByRole("tenant");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "GetLeaveBalance") req.alias = "getLeaveBalance";
      if (req.body?.operationName === "InitLeaveBalancesForEmployee") req.alias = "initBalances";
    });
    cy.visit("/hr/dashboard/leave");
    selectSearchOption("Employee", EMPLOYEE_SEARCH_TEXT, EMPLOYEE_SEARCH_TEXT);
    cy.wait("@getLeaveBalance");

    // "Initialise balances" (no balances at all yet) and "Sync balances" (some
    // already exist, e.g. from an unrelated earlier flow) are two different
    // buttons for the same mutation -- click whichever is present.
    cy.get("body").then(($body) => {
      if (!$body.text().toLowerCase().includes(LEAVE_TYPE_VALUE)) {
        cy.contains("button", /initialise balances|sync balances/i).click();
        cy.wait("@initBalances");
      }
    });

    cy.contains(LEAVE_TYPE_VALUE, { matchCase: false }).should("exist");
    cy.contains(OTHER_LEAVE_TYPE_VALUE, { matchCase: false }).should("exist");
  });

  it("teacher applies for leave, admin approves it, and the balance decrements by exactly the requested days", () => {
    let balanceBefore: number;

    cy.loginByRole("teacher");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "GetMyLeaveBalance") req.alias = "getMyLeaveBalance";
      if (req.body?.operationName === "ApplyLeave") req.alias = "applyLeave";
    });
    cy.visit("/teacher/dashboard/leave");
    cy.wait("@getMyLeaveBalance").then((interception) => {
      const balances = interception.response?.body?.data?.getMyLeaveBalance ?? [];
      const maternity = balances.find(
        (b: { leaveType: string }) => b.leaveType.toLowerCase() === LEAVE_TYPE_VALUE,
      );
      expect(maternity, "maternity balance exists before applying").to.be.an("object");
      balanceBefore = maternity.remainingDays;

      cy.contains("button", "Apply for leave").click();
      selectMuiOption("Leave type", "Maternity");
      openDialog().within(() => {
        const today = new Date();
        // Single day, not a 2-day span -- repeated spec runs against the same
        // dev tenant have driven this employee's Maternity balance down close
        // to 0, and a wider span risks tripping exceedsBalance's Submit-disable
        // guard (correct app behaviour, not a bug) on a low-balance re-run.
        const start = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);
        const end = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);
        const fmt = (d: Date) => d.toISOString().slice(0, 10);
        cy.contains("label", "Start date").parent().find("input").type(fmt(start));
        cy.contains("label", "End date").parent().find("input").type(fmt(end));
        cy.contains("label", "Reason (optional)").parent().find("textarea").first().type(APPROVE_REASON);
        cy.contains("button", "Submit").click();
      });
      cy.wait("@applyLeave");
      cy.contains("Leave application submitted.").should("exist");
    }).then(() => {
      showAllRows();
      cy.contains("tr", APPROVE_REASON).should("contain", "Pending");

      cy.loginByRole("tenant");
      cy.intercept("POST", "**/graphql", (req) => {
        if (req.body?.operationName === "GetLeaveApplications") req.alias = "getLeaveApplications";
        if (req.body?.operationName === "ApproveLeave") req.alias = "approveLeave";
        if (req.body?.operationName === "GetLeaveBalance") req.alias = "getLeaveBalanceAdmin";
      });
      cy.visit("/hr/dashboard/leave");
      selectSearchOption("Employee", EMPLOYEE_SEARCH_TEXT, EMPLOYEE_SEARCH_TEXT);
      cy.wait("@getLeaveApplications");
      // Consume the balance fetch triggered by selecting the employee, so the
      // next @getLeaveBalanceAdmin wait below grabs the post-approve refetch
      // (added to LeaveWorkspace.tsx's handleApprove -- it never refreshed the
      // balance panel after approving before this fix), not this earlier one.
      cy.wait("@getLeaveBalanceAdmin");
      showAllRows();

      cy.contains("tr", APPROVE_REASON).scrollIntoView().find("button").first().click();
      cy.wait("@approveLeave");
      cy.wait("@getLeaveBalanceAdmin").then((interception) => {
        const balances = interception.response?.body?.data?.getLeaveBalance ?? [];
        const maternity = balances.find(
          (b: { leaveType: string }) => b.leaveType.toLowerCase() === LEAVE_TYPE_VALUE,
        );
        expect(maternity.remainingDays).to.eq(balanceBefore - 1);
      });
    });
  });

  it("admin rejects a pending leave request and the balance is unaffected", () => {
    let balanceBefore: number;

    cy.loginByRole("teacher");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "GetMyLeaveBalance") req.alias = "getMyLeaveBalance";
      if (req.body?.operationName === "ApplyLeave") req.alias = "applyLeave";
    });
    cy.visit("/teacher/dashboard/leave");
    cy.wait("@getMyLeaveBalance").then((interception) => {
      const balances = interception.response?.body?.data?.getMyLeaveBalance ?? [];
      const sick = balances.find(
        (b: { leaveType: string }) => b.leaveType.toLowerCase() === OTHER_LEAVE_TYPE_VALUE,
      );
      balanceBefore = sick.remainingDays;

      cy.contains("button", "Apply for leave").click();
      selectMuiOption("Leave type", "Sick");
      openDialog().within(() => {
        const today = new Date();
        const start = new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000);
        const end = new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000);
        const fmt = (d: Date) => d.toISOString().slice(0, 10);
        cy.contains("label", "Start date").parent().find("input").type(fmt(start));
        cy.contains("label", "End date").parent().find("input").type(fmt(end));
        cy.contains("label", "Reason (optional)").parent().find("textarea").first().type(REJECT_REASON);
        cy.contains("button", "Submit").click();
      });
      cy.wait("@applyLeave");
    }).then(() => {
      cy.loginByRole("tenant");
      cy.intercept("POST", "**/graphql", (req) => {
        if (req.body?.operationName === "GetLeaveApplications") req.alias = "getLeaveApplications";
        if (req.body?.operationName === "RejectLeave") req.alias = "rejectLeave";
        if (req.body?.operationName === "GetLeaveBalance") req.alias = "getLeaveBalanceAdmin";
      });
      cy.visit("/hr/dashboard/leave");
      selectSearchOption("Employee", EMPLOYEE_SEARCH_TEXT, EMPLOYEE_SEARCH_TEXT);
      cy.wait("@getLeaveApplications");
      showAllRows();

      // Table has a sticky header (enableStickyHeader) that can still cover a
      // row's action buttons after scrollIntoView() lands it right at the top
      // edge -- force the click past that purely-visual overlap. Business
      // logic (reject actually flips status + leaves the balance untouched)
      // is independently verified by the assertions right below, not by this
      // click succeeding through the DOM in a visually "clean" spot.
      cy.contains("tr", REJECT_REASON).scrollIntoView().find("button").eq(1).click({ force: true });

      cy.get('[role="dialog"]').filter(":visible").within(() => {
        cy.get("textarea, input[type=text]").first().type("Cypress rejection reason");
        cy.contains("button", "Reject").click();
      });
      cy.wait("@rejectLeave");
      cy.contains("tr", "Rejected", { matchCase: false }).should("exist");

      cy.wait("@getLeaveBalanceAdmin").then((interception) => {
        const balances = interception.response?.body?.data?.getLeaveBalance ?? [];
        const sick = balances.find(
          (b: { leaveType: string }) => b.leaveType.toLowerCase() === OTHER_LEAVE_TYPE_VALUE,
        );
        expect(sick.remainingDays).to.eq(balanceBefore);
      });
    });
  });

  it("teacher applies for leave and cancels it themselves before any admin action; balance is unaffected", () => {
    let balanceBefore: number;

    cy.loginByRole("teacher");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "GetMyLeaveBalance") req.alias = "getMyLeaveBalance";
      if (req.body?.operationName === "ApplyLeave") req.alias = "applyLeave";
      if (req.body?.operationName === "CancelLeave") req.alias = "cancelLeave";
      if (req.body?.operationName === "GetMyLeaveApplications") req.alias = "getMyLeaveApplications";
    });
    cy.visit("/teacher/dashboard/leave");
    // Consume the page-load fetch so the later @getMyLeaveApplications wait
    // grabs the post-cancel refetch, not this earlier snapshot -- same
    // unconsumed-intercept-queue gotcha as the admin balance fix above.
    cy.wait("@getMyLeaveApplications");
    cy.wait("@getMyLeaveBalance").then((interception) => {
      const balances = interception.response?.body?.data?.getMyLeaveBalance ?? [];
      const sick = balances.find(
        (b: { leaveType: string }) => b.leaveType.toLowerCase() === OTHER_LEAVE_TYPE_VALUE,
      );
      balanceBefore = sick.remainingDays;

      cy.contains("button", "Apply for leave").click();
      selectMuiOption("Leave type", "Sick");
      openDialog().within(() => {
        const today = new Date();
        const start = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        const end = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        const fmt = (d: Date) => d.toISOString().slice(0, 10);
        cy.contains("label", "Start date").parent().find("input").type(fmt(start));
        cy.contains("label", "End date").parent().find("input").type(fmt(end));
        cy.contains("label", "Reason (optional)").parent().find("textarea").first().type(CANCEL_REASON);
        cy.contains("button", "Submit").click();
      });
      cy.wait("@applyLeave");
      // handleApply also refetches the list on success -- consume that one too
      // so the wait after cancelLeave below gets the true post-cancel refetch.
      cy.wait("@getMyLeaveApplications");
    }).then(() => {
      showAllRows();
      cy.contains("tr", CANCEL_REASON).within(() => {
        cy.contains("button", "Cancel").click();
      });
      cy.wait("@cancelLeave");
      cy.wait("@getMyLeaveApplications");
      cy.contains("tr", CANCEL_REASON).should("contain", "Cancelled");

      cy.reload();
      cy.wait("@getMyLeaveBalance").then((interception) => {
        const balances = interception.response?.body?.data?.getMyLeaveBalance ?? [];
        const sick = balances.find(
          (b: { leaveType: string }) => b.leaveType.toLowerCase() === OTHER_LEAVE_TYPE_VALUE,
        );
        expect(sick.remainingDays).to.eq(balanceBefore);
      });
    });
  });
});
