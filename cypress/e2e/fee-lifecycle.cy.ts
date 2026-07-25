/// <reference types="cypress" />

// End-to-end walk of the fee module: an admin sets a late fine policy,
// generates a batch's monthly invoices from its existing fee plan, collects a
// partial payment, finishes it off from the Bills & Invoices page, then runs
// a separate invoice through the request/approve waiver path — finally
// checking the student's own self-service view. Run headed to watch it live:
//   npx cypress open
//
// Needs cypress.env.json with "tenant" and "student" users (see
// cypress/support/commands.ts) and both the backend and frontend running.
//
// Traced from InvoiceService/PaymentService/StudentInvoice/Discount before
// writing this:
//  - generateMonthlyInvoices only picks up MONTHLY-frequency fee plans for the
//    batch (ONE_TIME plans, e.g. admission fees, are never auto-invoiced).
//    The real "Class 9 · Science" batch already has an active MONTHLY_TUITION
//    plan (1500) — reused as-is rather than creating a new one, since fee
//    types/plans/discounts have no delete/deactivate mutation and would
//    otherwise accumulate forever.
//  - Every generic discount (blank applicableRuleJson) applies to ALL
//    invoices tenant-wide, not just one student/batch — creating a new one
//    for this spec would silently change every other invoice's total, so
//    this spec does not create a discount. The tenant's real "Early Bird"
//    discount has already passed its deadline, so this spec's invoices
//    should show discountAmount = 0 — asserted explicitly.
//  - A real bug was found and fixed while tracing this: billing-shared.tsx's
//    FINE_TYPE_OPTIONS offered "PERCENTAGE"/"PER_DAY", neither of which is a
//    valid backend LateFineType (FIXED/PERCENTAGE_PER_DAY) — selecting them
//    would throw. Also OUTSTANDING_STATUSES/INVOICE_STATUS_LABEL used
//    "UNPAID"/"PARTIAL"/"WAIVER_REQUESTED", none of which are real
//    InvoiceStatus values (DRAFT/ISSUED/PARTIALLY_PAID/PAID/OVERDUE/WAIVED/
//    PENDING_WAIVER) — this silently hid the "Pay" button on partially-paid
//    invoices and the "Approve waiver" menu item on waiver-requested ones on
//    the Bills & Invoices page. Tests 5 and 8 below are the regression checks
//    for those two fixes.

const BATCH_SEARCH_TEXT = "Class 9 · Science";

const openDialog = () => cy.get('[role="dialog"]').filter(":visible").first();

// Same hydration-race retry pattern used in payroll-lifecycle.cy.ts /
// exam-lifecycle.cy.ts — a plain single type() intermittently drops
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

const selectSearchOption = (label: string, searchText: string, optionText: string) => {
  cy.contains("label", label).parent().find("input").click().type(searchText);
  cy.get('[role="option"]').contains(optionText).click();
};

// MonthField is a native input[type=month] — .type() works reliably on it
// (unlike a raw text field standing in for a date), but retry until the
// value actually sticks anyway, same hydration-race precaution as elsewhere
// in this suite.
const setMonth = (value: string) => {
  typeFieldReliably(() => cy.contains("label", "Month").parent().find("input"), value);
  cy.contains("label", "Month").parent().find("input").should("have.value", value);
};

const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Fee types/plans/discounts have no delete/deactivate mutation, and invoices
// are keyed per (tenant, batch, student, month) — a fixed test month would
// collide with a previous run's leftover invoice and generateMonthlyInvoices
// would silently skip it ("already invoiced"). Pushed decades into the
// future (same trick as PAYROLL_YEAR in payroll-lifecycle.cy.ts) so repeated
// runs while developing this spec stay independent, and widened well past
// any realistic same-day re-run count.
const FEE_YEAR = new Date().getFullYear() + 60 + (Date.now() % 5_000);
const MONTH_INDEX = Date.now() % 12; // 0-11
const FEE_MONTH = `${FEE_YEAR}-${String(MONTH_INDEX + 1).padStart(2, "0")}`;
const FEE_MONTH_LABEL_FULL = `${MONTH_NAMES_FULL[MONTH_INDEX]} ${FEE_YEAR}`;

// A second, independent month for the waiver flow so approving/waiving it
// can't be confused with the fully-paid invoice from the payment flow above.
const WAIVER_YEAR = FEE_YEAR + 1;
const WAIVER_MONTH = `${WAIVER_YEAR}-${String(MONTH_INDEX + 1).padStart(2, "0")}`;
const WAIVER_MONTH_LABEL_FULL = `${MONTH_NAMES_FULL[MONTH_INDEX]} ${WAIVER_YEAR}`;

// Matches the real, currently-active MONTHLY_TUITION fee plan on the
// "Class 9 · Science" batch — the only MONTHLY plan on that batch, so this is
// exactly what generateMonthlyInvoices will bill.
const MONTHLY_FEE_AMOUNT = 1500;
const PARTIAL_PAYMENT = 900;
const REMAINING_PAYMENT = MONTHLY_FEE_AMOUNT - PARTIAL_PAYMENT;

describe("Fee lifecycle — late fine policy, invoicing, collection, waiver", () => {
  it("admin: sets (or reuses, on a re-run) the late fine policy", () => {
    // setLateFinePolicy is a per-tenant upsert (no uniqueness collision to
    // dodge), so this is safe to submit identically on every run.
    cy.loginByRole("tenant");
    cy.visit("/dashboard/fees/academic-fees");
    cy.contains('[role="tab"]', "Late Fine Policy").click();

    // Regression check for the FINE_TYPE_OPTIONS fix — PERCENTAGE_PER_DAY is
    // the only percentage-style value the backend LateFineType enum accepts.
    cy.contains("label", "Fine type").parent().find('[role="combobox"]').click();
    cy.get('[role="option"]').contains("Percentage per day overdue").click();
    cy.contains("label", "Fine type").parent().should("contain", "Percentage per day overdue");

    typeFieldReliably(() => cy.contains("label", "Percentage per day").parent().find("input"), "2");
    typeFieldReliably(() => cy.contains("label", "Grace days").parent().find("input"), "3");
    cy.contains("button", /save policy|configure|update/i).click();

    cy.contains("Current policy").should("exist");
    cy.contains("2%/day after 3d").should("exist");
  });

  it("admin: generates monthly invoices for the batch (policy-resolved amount, no discount)", () => {
    cy.loginByRole("tenant");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "GenerateMonthlyStudentInvoices") req.alias = "generateInvoices";
    });
    cy.visit("/dashboard/fees/payments");

    selectSearchOption("Batch", BATCH_SEARCH_TEXT, BATCH_SEARCH_TEXT);
    setMonth(FEE_MONTH);

    cy.contains("button", "Generate invoices").click();
    cy.get('[role="dialog"]').filter(":visible").contains("button", "Generate").click({ force: true });
    cy.wait("@generateInvoices");

    cy.contains("tr", "Sakib").should("exist");
    cy.contains("tr", "Sakib").within(() => {
      cy.contains(`৳${MONTHLY_FEE_AMOUNT.toLocaleString()}`).should("exist"); // Total
      cy.contains("Unpaid").should("exist");
    });
  });

  it("admin: re-generating the same batch/month is a no-op (duplicate-invoice guard)", () => {
    cy.loginByRole("tenant");
    cy.visit("/dashboard/fees/payments");

    selectSearchOption("Batch", BATCH_SEARCH_TEXT, BATCH_SEARCH_TEXT);
    setMonth(FEE_MONTH);

    cy.contains("button", "Generate invoices").click();
    cy.get('[role="dialog"]').filter(":visible").contains("button", "Generate").click({ force: true });

    cy.contains("No new invoices needed").should("exist");
    // Still exactly one defaulter row for this student/month — no duplicate.
    cy.get("tbody tr").filter((_, el) => el.textContent?.includes("Sakib") ?? false)
      .should("have.length", 1);
  });

  it("admin: collects a partial payment from the Collections (defaulters) view", () => {
    cy.loginByRole("tenant");
    cy.visit("/dashboard/fees/payments");

    selectSearchOption("Batch", BATCH_SEARCH_TEXT, BATCH_SEARCH_TEXT);
    setMonth(FEE_MONTH);

    cy.contains("tr", "Sakib").contains("button", "Collect").click();
    openDialog().within(() => {
      cy.contains("label", "Amount").parent().find("input").clear().type(String(PARTIAL_PAYMENT));
      cy.contains("button", "Confirm Payment").click();
    });

    // The row stays in defaulters (PARTIALLY_PAID is still an outstanding
    // status server-side) with updated paid/outstanding figures.
    cy.contains("tr", "Sakib").within(() => {
      cy.contains(`৳${PARTIAL_PAYMENT.toLocaleString()}`).should("exist"); // Paid
      cy.contains(`৳${REMAINING_PAYMENT.toLocaleString()}`).should("exist"); // Outstanding
      cy.contains("Partial").should("exist");
    });
  });

  it("admin: finishes the payment from Bills & Invoices — regression check for the Pay-button fix", () => {
    cy.loginByRole("tenant");
    cy.visit("/dashboard/fees/invoices");

    selectSearchOption("Batch", BATCH_SEARCH_TEXT, BATCH_SEARCH_TEXT);
    setMonth(FEE_MONTH);

    // Before the OUTSTANDING_STATUSES fix, "PARTIALLY_PAID" never matched
    // any set entry, so the row-level "Pay" button silently never rendered
    // for a partially-paid invoice — this is the actual regression check.
    cy.contains("tr", "Sakib").should("contain", "Partial");
    // .should("exist") not "be.visible" — MRT's table container clips this
    // cell at some viewport widths; existence is what the regression check
    // actually cares about. {force: true} for the same reason on the click.
    cy.contains("tr", "Sakib").find("button").contains("Pay").should("exist").click({ force: true });

    openDialog().within(() => {
      cy.contains("button", "Confirm Payment").click();
    });

    cy.contains("tr", "Sakib").should("contain", "Paid");
    cy.contains("tr", "Sakib").find("button").contains("Pay").should("not.exist");
  });

  it("admin: the settled invoice drops out of the defaulters list", () => {
    cy.loginByRole("tenant");
    cy.visit("/dashboard/fees/payments");

    selectSearchOption("Batch", BATCH_SEARCH_TEXT, BATCH_SEARCH_TEXT);
    setMonth(FEE_MONTH);

    cy.contains("No defaulters").should("exist");
  });

  it("admin: generates a second invoice (separate month) for the waiver flow", () => {
    cy.loginByRole("tenant");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "GenerateMonthlyStudentInvoices") req.alias = "generateInvoices";
    });
    cy.visit("/dashboard/fees/payments");

    selectSearchOption("Batch", BATCH_SEARCH_TEXT, BATCH_SEARCH_TEXT);
    setMonth(WAIVER_MONTH);

    cy.contains("button", "Generate invoices").click();
    cy.get('[role="dialog"]').filter(":visible").contains("button", "Generate").click({ force: true });
    cy.wait("@generateInvoices");

    cy.contains("tr", "Sakib").should("contain", "Unpaid");
  });

  it("admin: requests a waiver on the second invoice", () => {
    cy.loginByRole("tenant");
    cy.visit("/dashboard/fees/invoices");

    selectSearchOption("Batch", BATCH_SEARCH_TEXT, BATCH_SEARCH_TEXT);
    setMonth(WAIVER_MONTH);

    cy.contains("tr", "Sakib")
      .find('button[aria-haspopup="menu"], button')
      .last()
      .click({ force: true });
    cy.contains('[role="menuitem"]', "Request waiver").click();

    cy.contains("tr", "Sakib").should("contain", "Waiver requested");
  });

  it("admin: approves the waiver — regression check for the Approve-waiver fix", () => {
    cy.loginByRole("tenant");
    cy.visit("/dashboard/fees/invoices");

    selectSearchOption("Batch", BATCH_SEARCH_TEXT, BATCH_SEARCH_TEXT);
    setMonth(WAIVER_MONTH);

    // Before the isWaiverRequested fix ("WAIVER_REQUESTED" vs the real
    // "PENDING_WAIVER"), this menu item never appeared for a waiver-requested
    // invoice — this is the actual regression check.
    cy.contains("tr", "Sakib")
      .find('button[aria-haspopup="menu"], button')
      .last()
      .click({ force: true });
    cy.contains('[role="menuitem"]', "Approve waiver").should("be.visible").click();

    cy.contains("tr", "Sakib").should("contain", "Waived");
  });

  // The invoice row has no distinguishing class (MUI hashes them), so scope
  // by walking up ancestors of the month label until one also contains every
  // other expected string (status + amount) — the nearest such ancestor is
  // the row's own container. A single required substring isn't enough: the
  // month/status Chip already share a much smaller inner Stack that doesn't
  // include the amount, which sits in a sibling Stack one level up.
  const withinInvoiceRow = (monthLabel: string, mustContainAll: string[], assert: () => void) => {
    cy.contains(monthLabel)
      .parents()
      .filter((_, el) => mustContainAll.every((s) => el.textContent?.includes(s) ?? false))
      .first()
      .within(assert);
  };

  it("student: sees both invoices in self-service My Fees with correct amounts and statuses", () => {
    cy.loginByRole("student");
    cy.visit("/student/fees");

    const paidAmountText = `৳${MONTHLY_FEE_AMOUNT.toLocaleString()}`;
    withinInvoiceRow(FEE_MONTH_LABEL_FULL, ["Paid", paidAmountText], () => {
      cy.contains("Paid").should("exist");
      cy.contains(paidAmountText).should("exist");
    });

    withinInvoiceRow(WAIVER_MONTH_LABEL_FULL, ["Waived"], () => {
      cy.contains("Waived").should("exist");
    });
  });
});
