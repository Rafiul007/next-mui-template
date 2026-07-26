/// <reference types="cypress" />

// Regression coverage for real file uploads (as opposed to pasting a URL)
// across the academic module: a teacher/admin uploads a study material file
// and a student submits an assignment with an attached file. Run headed to
// watch it live:
//   npx cypress open
//
// Needs cypress.env.json with "tenant" and "student" users (see
// cypress/support/commands.ts) and both the backend and frontend running.
//
// Traced from MaterialsWorkspace.tsx / AssignmentsWorkspace.tsx / MaterialService
// before writing this, and found + fixed two real gaps:
//  - The "Upload Material" dialog (teacher/admin side) had NO file input at
//    all -- only a "Video URL" text field -- even though the backend's
//    UploadMaterialInput/uploadMaterial has accepted fileDataBase64/fileName
//    since the file-storage module was wired in. Uploading an actual
//    document (PDF, notes, etc.) was simply impossible from the UI; every
//    material was silently link-only. Added a file picker that base64-encodes
//    the file and passes it through. Test 1 below is the regression check.
//  - The student's "Submit Assignment" dialog only offered a "Submission
//    link" text field. Worse, the backend's own submitMyAssignment mutation
//    (unlike the teacher-facing submitAssignment) never even accepted
//    fileDataBase64/fileName -- so there was no way to add file support to
//    the student flow without a backend schema change. Added the missing
//    args to submitMyAssignment (schema, resolver, service) and a file picker
//    on the student dialog. Test 3 below is the regression check.

const BATCH_SEARCH_TEXT = "Class 9 · Science";

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

const selectSearchOption = (label: string, searchText: string, optionText: string) => {
  cy.contains("label", label).parent().find("input").click().type(searchText);
  cy.get('[role="option"]').contains(optionText).click();
};

// Unique per run so re-running this spec never collides with a leftover
// material/assignment from a previous pass.
const RUN_ID = Date.now();
const MATERIAL_TITLE = `Cypress File Upload QA ${RUN_ID}`;
const ASSIGNMENT_TITLE = `Cypress File Submission QA ${RUN_ID}`;

describe("File upload lifecycle — study materials and assignment submissions", () => {
  it("admin: uploads a study material with a real attached file (not a URL) — regression check", () => {
    cy.loginByRole("tenant");
    cy.visit("/dashboard/academic/materials");

    selectSearchOption("Select batch", BATCH_SEARCH_TEXT, BATCH_SEARCH_TEXT);

    cy.contains("button", "Upload Material").click();
    openDialog().within(() => {
      typeFieldReliably(() => cy.contains("label", "Title").parent().find("input"), MATERIAL_TITLE);
      cy.get('input[type="file"]').selectFile("cypress/fixtures/sample-material.txt", { force: true });
      cy.contains("sample-material.txt").should("exist");
    });

    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "UploadMaterial") req.alias = "uploadReq";
    });
    openDialog().within(() => {
      cy.contains("button", "Upload").click();
    });
    cy.wait("@uploadReq").its("response.body.data.uploadMaterial.filePath").should("be.a", "string").and("not.be.empty");
    cy.contains("Material uploaded.").should("exist");

    // Before the fix there was no way to attach a file at all, so filePath
    // was always null and no "File" chip / open-file button ever rendered.
    cy.contains(MATERIAL_TITLE)
      .parents('[class*="MuiPaper-root"]')
      .first()
      .within(() => {
        cy.contains("File").should("exist");
        cy.get('a[href]').should("have.attr", "href").and("not.be.empty");
      });
  });

  it("admin: creates an assignment on the same batch for students to submit against", () => {
    cy.loginByRole("tenant");
    cy.visit("/dashboard/academic/materials");
    selectSearchOption("Select batch", BATCH_SEARCH_TEXT, BATCH_SEARCH_TEXT);

    cy.contains("button", "New Assignment").click();
    openDialog().within(() => {
      typeFieldReliably(() => cy.contains("label", "Assignment title").parent().find("input"), ASSIGNMENT_TITLE);
    });
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "CreateAssignment") req.alias = "createReq";
    });
    openDialog().within(() => {
      cy.contains("button", "Create Assignment").click();
    });
    cy.wait("@createReq");
    cy.contains("Assignment created.").should("exist");
    cy.contains("button", /Assignments \(\d+\)/).click();
    cy.contains(ASSIGNMENT_TITLE).should("exist");
  });

  it("student: submits the assignment with an attached file and no link — regression check for submitMyAssignment file support", () => {
    cy.loginByRole("student");
    cy.visit("/student/assignments");

    cy.contains(ASSIGNMENT_TITLE)
      .parents('[class*="MuiPaper-root"]')
      .first()
      .within(() => {
        cy.contains("button", "Submit").click();
      });

    openDialog().within(() => {
      cy.get('input[type="file"]').selectFile("cypress/fixtures/sample-submission.txt", { force: true });
      cy.contains("sample-submission.txt").should("exist");
    });

    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "SubmitMyAssignment") req.alias = "submitReq";
    });
    openDialog().within(() => {
      cy.contains("button", "Confirm Submit").click();
    });
    cy.wait("@submitReq").its("response.body.data.submitMyAssignment.filePath").should("be.a", "string").and("not.be.empty");
    cy.contains("Assignment submitted.").should("exist");

    // Before the fix, submitMyAssignment had no file params at all, so
    // filePath would always come back null and this link would never render.
    cy.contains(ASSIGNMENT_TITLE)
      .parents('[class*="MuiPaper-root"]')
      .first()
      .within(() => {
        cy.contains("Submitted").should("exist");
        cy.get('a[href]').should("have.attr", "href").and("not.be.empty");
      });
  });
});
