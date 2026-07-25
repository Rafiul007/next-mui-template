/// <reference types="cypress" />

// End-to-end walk of the exam module across three real roles: a teacher
// drafts + builds + submits an exam, a center admin approves / schedules /
// publishes, and a student attempts it. Run headed to watch it live:
//   npx cypress open
// then pick this spec — that's the point of this file: a scripted tour you
// can eyeball for UI bugs, not just a pass/fail gate.
//
// Needs cypress.env.json with "teacher", "tenant", "student", "student2" users
// (see cypress/support/commands.ts for the shape) and both the backend
// (mvn spring-boot:run) and frontend (yarn dev) running.
//

const BATCH_INPUT = 'input[placeholder="Search by name, class, or course…"]';

type Shared = { title: string; batchName: string };
const shared: Shared = { title: "", batchName: "" };

const examCard = (title: string) => cy.contains(".MuiPaper-root", title);

// Only one Dialog is ever open at a time in this UI, but MUI can leave a
// second (closed/exiting) role="dialog" node in the DOM briefly — filter to
// the one actually visible so `.within()` never sees more than one element.
const openDialog = () => cy.get('[role="dialog"]').filter(":visible").first();

// Types into the Batch Autocomplete and picks the matching option from the
// popper (rendered in a portal at document body, so a plain cy.get reaches it).
// Next.js hydration can interleave/drop keystrokes into a freshly-focused
// controlled input (same race commands.ts works around for the login form),
// so retry clear+type until the field actually holds the full string instead
// of trusting a single cy.type() call.
const typeBatch = (name: string, attempt = 0) => {
  cy.get(BATCH_INPUT).click().clear().type(name);
  cy.get(BATCH_INPUT)
    .invoke("val")
    .then((current) => {
      if (current !== name && attempt < 8) {
        typeBatch(name, attempt + 1);
      }
    });
};

const selectBatch = (name: string) => {
  typeBatch(name);
  cy.get(BATCH_INPUT).should("have.value", name);
  cy.get('[role="option"]').contains(name).click();
};

const nearFutureDatetimeLocal = () => {
  const d = new Date(Date.now() + 5 * 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

describe("Exam lifecycle — teacher drafts, admin approves & publishes, student attempts", () => {
  before(() => {
    shared.title = `Cypress Exam ${Date.now()}`;
  });

  it("teacher: creates a draft exam and adds a question", () => {
    cy.loginByRole("teacher");
    cy.visit("/teacher/dashboard/exams");

    // Teacher console defaults to the teacher's own first batch. Capture its
    // name so the admin step below selects the very same batch.
    cy.get(BATCH_INPUT, { timeout: 15000 }).invoke("val").should("not.eq", "");
    cy.get(BATCH_INPUT)
      .invoke("val")
      .then((val) => {
        shared.batchName = String(val);
      });

    cy.contains("button", "New draft exam").click();
    openDialog().within(() => {
      cy.contains("label", "Exam title")
        .parent()
        .find("input")
        .type(shared.title);
      cy.contains("button", "Create draft").click();
    });

    examCard(shared.title).should("contain", "DRAFT");

    // Add one inline single-select question so the exam has something to submit.
    examCard(shared.title).contains("button", "Questions").click();
    cy.contains('[role="tab"]', "Add new (inline)").click();
    openDialog().within(() => {
      cy.contains("label", "Question text")
        .parent()
        .find("textarea")
        .first()
        .type("What is the boiling point of water at sea level, in Celsius?");
      cy.get('input[placeholder="Option 1"]').type("100");
      cy.get('input[placeholder="Option 2"]').type("90");
      // Mark option 1 (the row containing the "Option 1" field) as correct.
      cy.get('input[placeholder="Option 1"]')
        .parents(".MuiStack-root")
        .first()
        .find('input[type="checkbox"]')
        .check();
      cy.contains("button", "Add question").click();
      cy.contains("button", "Close").click();
    });

    examCard(shared.title).contains("button", "Submit for approval").click();
    examCard(shared.title).should("contain", "PENDING APPROVAL");
  });

  it("admin: approves, schedules, and assigns the exam", () => {
    cy.loginByRole("tenant");
    cy.visit("/dashboard/academic/exams");

    selectBatch(shared.batchName);
    examCard(shared.title).should("contain", "PENDING APPROVAL");
    examCard(shared.title).contains("button", "Approve").click();
    examCard(shared.title).should("contain", "APPROVED");

    examCard(shared.title).contains("button", "Schedule").click();
    openDialog().within(() => {
      cy.get('input[type="datetime-local"]').type(nearFutureDatetimeLocal());
      // "Assign to all active students in this batch" is checked by default —
      // leave it, so whichever demo student is enrolled gets the exam.
      cy.contains("button", "Schedule exam").click();
      cy.contains("button", "Close").click();
    });

    examCard(shared.title).should("contain", "SCHEDULED");
  });

  it("student: finds, starts, answers, and submits the exam", () => {
    // "student" (shakib@gmail.com) is the demo account enrolled in the batch
    // the teacher/admin steps used above — see cypress.env.json.
    cy.loginByRole("student");
    cy.visit("/student/exams");

    examCard(shared.title).contains("button", "Open").click();
    // First visit to this dynamic route triggers an on-demand Next.js dev
    // compile — give it more room than the default 4s.
    cy.contains("button", "Start exam", { timeout: 20000 }).click();

    // Answer the single question (first radio option).
    cy.get('input[type="radio"]').first().check({ force: true });
    cy.contains("Saving…").should("not.exist");

    cy.contains("button", "Submit exam").click();
    openDialog().within(() => {
      cy.contains("button", "Submit").click();
    });
    cy.contains("Exam submitted").should("be.visible");
  });

  it("teacher: enters marks for the submitted attempt", () => {
    cy.loginByRole("teacher");
    cy.visit("/teacher/dashboard/exams");
    cy.get(BATCH_INPUT, { timeout: 15000 }).invoke("val").should("eq", shared.batchName);

    examCard(shared.title).contains("button", "Enter marks").should("not.be.disabled").click();
    openDialog().within(() => {
      cy.get("tbody tr").each(($row) => {
        cy.wrap($row).find('input[type="number"]').clear().type("80");
      });
      cy.contains("button", "Save marks").click();
    });
  });

  it("admin: views results and publishes via the exam-card Publish button", () => {
    cy.loginByRole("tenant");
    cy.visit("/dashboard/academic/exams");
    selectBatch(shared.batchName);

    examCard(shared.title).contains("button", "Results").click();
    openDialog().within(() => {
      cy.get("tbody tr").should("have.length.greaterThan", 0);
      cy.contains("button", "Close").click();
    });

    // Regression check: the exam-card row's "Publish" button used to require
    // exam.status === COMPLETED, a state nothing in the app ever sets, making
    // it permanently unreachable for a SCHEDULED exam. It must be visible and
    // enabled here, and clicking it (not the Results dialog's own Publish
    // button) is what actually exercises the fix.
    examCard(shared.title)
      .contains("button", "Publish")
      .should("be.visible")
      .and("not.be.disabled")
      .click();

    examCard(shared.title).should("contain", "Results published");
  });
});
