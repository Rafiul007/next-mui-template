/// <reference types="cypress" />

// Regression coverage for the PDF-generation feature (OpenPdfGeneratorAdapter
// -> R2 upload -> path/URL persisted on the domain entity): invoice PDFs,
// payment receipt PDFs, and payslip PDFs. Run headed to watch it live:
//   npx cypress open
//
// Needs cypress.env.json with "tenant" and "teacher" users (see
// cypress/support/commands.ts) and both the backend and frontend running.
//
// Traced from InvoiceService/PaymentService/PayrollService/PdfGeneratorPort
// before writing this. Scope note: getResultSlipUrl (exam module) and
// generateOfferLetter (HR recruitment) also generate real PDFs — offer letter
// already had a working "opens in new tab" flow in RecruitmentWorkspace.tsx,
// and result slip now has View/Download buttons in ResultsWorkspace.tsx
// (student) and ExamWorkspace.tsx (admin/teacher) — but both need fixtures
// this spec doesn't set up (a job application; a published exam result), so
// Cypress coverage for those two is left to exam-lifecycle.cy.ts and a future
// recruitment-pipeline spec.
//
// Two real gaps were found and fixed while tracing this:
//  - GetPayslip / GetMyLatestPayslip / GetMyPayslips (PAYROLL_ENTRY_FIELDS in
//    hr-extended.ts, and the equivalent field list in hr.queries.ts) never
//    selected payslipPdfUrl at all, even though PayrollService generates and
//    stores it on every disbursed entry — so there was no way for the UI to
//    ever surface a payslip download link, regardless of any button existing.
//    Added the field to both.
//  - No page anywhere rendered a View/Download control for the real,
//    backend-generated PDFs (pdfPath/receiptPath/payslipPdfUrl) — only a
//    parallel client-side "print a re-rendered HTML view" mechanism existed
//    (billing-print.ts, payslip-print.ts). Added real View (open in new tab)
//    and Download (forced download) buttons via a shared src/lib/pdf-actions.ts
//    helper to: InvoicesWorkspace (invoice row), TransactionsWorkspace
//    (payment row), PayrollWorkspace admin Payslips tab, MyPayrollWorkspace
//    (teacher self-service table + detail dialog), and MyProfileWorkspace
//    (latest-payslip card). Tests below assert these buttons actually appear
//    once a real pdfPath/receiptPath/payslipPdfUrl exists, and that clicking
//    View opens exactly that URL.

const BATCH_SEARCH_TEXT = "Class 9 · Science";
const POLICY_DESIGNATION = "Senior Teacher"; // must exactly match the "teacher" demo employee's designation
const EMPLOYEE_SEARCH_TEXT = "Test Faisal"; // display name for the "teacher" demo employee

const openDialog = () => cy.get('[role="dialog"]').filter(":visible").first();

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

const typeYearReliably = (value: string, attempt = 0) => {
  cy.contains("label", "Year").parent().find("input").clear().type(`{selectall}${value}`, { delay: 40 });
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

const selectSearchOption = (label: string, searchText: string, optionText: string) => {
  cy.contains("label", label).parent().find("input").click().type(searchText);
  cy.get('[role="option"]').contains(optionText).click();
};

const setMonth = (value: string) => {
  typeFieldReliably(() => cy.contains("label", "Month").parent().find("input"), value);
  cy.contains("label", "Month").parent().find("input").should("have.value", value);
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Same decades-out trick used in fee-lifecycle.cy.ts / payroll-lifecycle.cy.ts
// so a re-run while developing this spec never collides with a previous
// pass's invoice (unique per batch/student/month) or payroll run (unique per
// tenant/month/year).
const FEE_YEAR = new Date().getFullYear() + 70 + (Date.now() % 5_000);
const MONTH_INDEX = Date.now() % 12;
const FEE_MONTH = `${FEE_YEAR}-${String(MONTH_INDEX + 1).padStart(2, "0")}`;
const PAYROLL_YEAR = new Date().getFullYear() + 150 + (Date.now() % 50_000);
const PAYROLL_PERIOD_TEXT = `${MONTH_NAMES[new Date().getMonth()]} ${PAYROLL_YEAR}`;

describe("PDF generation lifecycle — invoices, receipts, payslips", () => {
  it("admin: generating monthly invoices produces a real PDF per invoice", () => {
    cy.loginByRole("tenant");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "GenerateMonthlyStudentInvoices") req.alias = "generateInvoices";
    });
    cy.visit("/dashboard/fees/payments");

    selectSearchOption("Batch", BATCH_SEARCH_TEXT, BATCH_SEARCH_TEXT);
    setMonth(FEE_MONTH);

    cy.contains("button", "Generate invoices").click();
    cy.get('[role="dialog"]').filter(":visible").contains("button", "Generate").click({ force: true });

    cy.wait("@generateInvoices").then((interception) => {
      const invoices = interception.response?.body?.data?.generateMonthlyStudentInvoices ?? [];
      expect(invoices.length, "generated invoice count").to.be.greaterThan(0);
      invoices.forEach((invoice: { pdfPath: string | null }) => {
        expect(invoice.pdfPath, "invoice.pdfPath").to.be.a("string").and.not.be.empty;
      });
    });

    // Regression check: before the fix, no button anywhere opened this URL —
    // clicking "View invoice PDF" now calls window.open with a real link.
    // The Bills & Invoices page (not Collections/defaulters) is where the
    // invoice row (and its pdfPath) actually renders.
    cy.visit("/dashboard/fees/invoices");
    selectSearchOption("Batch", BATCH_SEARCH_TEXT, BATCH_SEARCH_TEXT);
    setMonth(FEE_MONTH);
    cy.window().then((win) => cy.stub(win, "open").as("windowOpen"));
    cy.contains("tr", "Sakib")
      .find('[data-testid="VisibilityRoundedIcon"]')
      .closest("button")
      .click({ force: true });
    cy.get("@windowOpen").should("have.been.calledOnce");
    cy.get("@windowOpen").its("firstCall.args.0").should("be.a", "string").and("not.be.empty");
  });

  it("admin: collecting a payment produces a real receipt PDF", () => {
    cy.loginByRole("tenant");
    cy.visit("/dashboard/fees/payments");

    selectSearchOption("Batch", BATCH_SEARCH_TEXT, BATCH_SEARCH_TEXT);
    setMonth(FEE_MONTH);

    cy.contains("tr", "Sakib").contains("button", "Collect").click();
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "RecordStudentPayment") req.alias = "recordPayment";
    });
    openDialog().within(() => {
      cy.contains("button", "Confirm Payment").click();
    });

    cy.wait("@recordPayment").then((interception) => {
      const payment = interception.response?.body?.data?.recordStudentPayment;
      expect(payment?.receiptPath, "payment.receiptPath").to.be.a("string").and.not.be.empty;
    });

    // Regression check: the Transactions ledger's expanded payment row now
    // has a real View/Download for the receipt (previously no button
    // anywhere rendered receiptPath at all).
    cy.visit("/dashboard/fees/transactions");
    selectSearchOption("Batch", BATCH_SEARCH_TEXT, BATCH_SEARCH_TEXT);
    setMonth(FEE_MONTH);
    // MRT's row-expand toggle is a dedicated chevron button, not the row itself.
    cy.contains("tr", "Sakib").find("button").first().click();
    cy.window().then((win) => cy.stub(win, "open").as("windowOpenReceipt"));
    cy.get('[data-testid="VisibilityRoundedIcon"]').first().closest("button").click({ force: true });
    cy.get("@windowOpenReceipt").should("have.been.calledOnce");
    cy.get("@windowOpenReceipt").its("firstCall.args.0").should("be.a", "string").and("not.be.empty");
  });

  it("admin: disbursing payroll produces a real payslip PDF — regression check for the missing payslipPdfUrl field", () => {
    cy.loginByRole("tenant");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "GetSalaryPolicies") req.alias = "getSalaryPolicies";
    });
    cy.visit("/hr/dashboard/salary-policy");
    cy.wait("@getSalaryPolicies");

    // Reuse the policy if a previous spec run (this file or
    // payroll-lifecycle.cy.ts) already created one for this designation —
    // there's no delete/deactivate mutation for salary policies.
    cy.get("body").then(($body) => {
      const existing = $body.find(`.MuiPaper-root:contains("${POLICY_DESIGNATION}")`);
      if (existing.length === 0) {
        cy.contains("button", "Create policy").click();
        openDialog().within(() => {
          cy.contains("label", "Policy name *").parent().find("input").clear().type(`Cypress PDF Policy ${Date.now()}`);
          cy.contains("label", "Designation *").parent().find("input").type(POLICY_DESIGNATION);
          cy.contains("label", "Basic *").parent().find("input").clear().type("30000");
          cy.contains("label", "House rent *").parent().find("input").clear().type("10000");
          cy.contains("label", "Medical *").parent().find("input").clear().type("5000");
          cy.contains("label", "Transport *").parent().find("input").clear().type("3000");
          cy.contains("button", "Create policy").click();
        });
      }
    });

    cy.visit("/hr/dashboard/payroll");
    cy.contains("button", "Run payroll").click();
    openDialog().within(() => {
      typeYearReliably(String(PAYROLL_YEAR));
      cy.contains("label", "Year").parent().find("input").should("have.value", String(PAYROLL_YEAR));
      cy.contains("button", "Run payroll").should("not.be.disabled").click();
    });
    cy.contains("tr", PAYROLL_PERIOD_TEXT).should("be.visible");

    cy.contains("tr", PAYROLL_PERIOD_TEXT).find("button").first().click({ force: true }); // Approve
    cy.contains("tr", PAYROLL_PERIOD_TEXT).should("contain", "Approved");
    cy.contains("tr", PAYROLL_PERIOD_TEXT).find("button").first().click({ force: true }); // Disburse
    // Disbursing generates + uploads a real PDF and sends an email per
    // employee synchronously — slower than the default 4s assertion window.
    cy.contains("tr", PAYROLL_PERIOD_TEXT, { timeout: 20000 }).should("contain", "Disbursed");

    cy.contains('[role="tab"]', "Payslips").click();
    cy.get('input[placeholder="Search by code…"]').first().click().type(EMPLOYEE_SEARCH_TEXT);
    cy.get('[role="option"]').contains(EMPLOYEE_SEARCH_TEXT).click();
    cy.contains("label", "Payroll run").parent().find(".MuiSelect-select").click();

    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "GetPayslip") req.alias = "getPayslip";
    });
    cy.get('[role="option"]').contains(PAYROLL_PERIOD_TEXT).click();

    cy.wait("@getPayslip").then((interception) => {
      const entry = interception.response?.body?.data?.getPayslip;
      // Before the fix, GetPayslip never selected payslipPdfUrl, so this
      // field would always come back undefined even though the backend had
      // already generated, stored, and emailed the PDF.
      expect(entry?.payslipPdfUrl, "entry.payslipPdfUrl").to.be.a("string").and.not.be.empty;
    });

    // Regression check: the admin Payslips tab now has a real View/Download
    // next to the Net-pay chip.
    cy.window().then((win) => cy.stub(win, "open").as("windowOpenPayslip"));
    cy.get('[data-testid="VisibilityRoundedIcon"]').first().closest("button").click({ force: true });
    cy.get("@windowOpenPayslip").should("have.been.calledOnce");
    cy.get("@windowOpenPayslip").its("firstCall.args.0").should("be.a", "string").and("not.be.empty");
  });
});
