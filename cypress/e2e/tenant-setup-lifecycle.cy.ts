/// <reference types="cypress" />

// Covers "Profile Setup" sidebar section (dashboard-menu.ts "tenant-setup"
// phase), none of which had e2e coverage before: Center Details, Branches,
// Calendar & Holidays, Organization Structure, Roles & Permissions.
//
// Traced components before writing this:
//  - CenterDetailsWorkspace.tsx: center already exists in this dev tenant, so
//    it always renders CenterProfileSummaryCard/TenantLegalSummaryCard with
//    an Edit button opening a Dialog with the *embedded* form -- there is no
//    create path exercised here.
//  - BranchesWorkspace.tsx: MaterialReactTable with row actions (Edit=0,
//    Deactivate=1, icon-only, Tooltip-wrapped, no aria-label -- same
//    find-by-position convention as leave/payroll specs). Address is a
//    single-line RhfTextField (input), not multiline. Deactivate needs a
//    confirm dialog.
//  - HolidaysWorkspace.tsx: simple create-only dialog (name/date/type),
//    holidays render grouped by month, not in a table.
//  - DepartmentsWorkspace.tsx: MaterialReactTable, create dialog + edit
//    dialog (single Edit icon per row, no delete). Name field label is
//    "Department name *", description is a real multiline/textarea.
//  - TeamAccessWorkspace.tsx (Roles & Permissions): two tabs -- Employees
//    (assign-role / activate-deactivate icon actions, Assign=0/Status=1) and
//    Roles (create custom role dialog + view-permissions dialog).
//    CreateRoleDialog has NO plain checkboxes -- permissions are granted via
//    a single "Grant" toggle per permission row, or in bulk via a "Grant all"
//    quick-select button for whichever permission group is active in the
//    left sidebar (first group active by default). Submit is disabled until
//    totalCount > 0. The role-name field has no <label>, just a placeholder
//    ("e.g. Batch coordinator") -- found by placeholder, not label.
//    Assign-role's action icon is disabled unless the employee row has a
//    linked user account and at least one role exists tenant-wide, so the
//    role must be created first in this same test.
//
// permission-registry.ts was FOUND BUGGY while writing this spec: it
// invented a {VALUE}_READ/{VALUE}_WRITE naming convention with several wrong
// base names that didn't exist in the real backend Permission enum
// (Permission.java) at all, so every custom-role creation failed with "No
// enum constant ...". Fixed by rewriting the registry to mirror
// Permission.java exactly (flat, real names) and reworking the dialog's UI
// from a fabricated Read/Write pair to a single Grant toggle. The role test
// below now grants permissions across ALL 8 groups (not just the first) and
// asserts the exact total count (53, i.e. every assignable enum value) --
// this is a real regression guard: submitting even one wrong enum name
// throws server-side, so this would catch any group's names drifting from
// Permission.java again. A second test directly confirms the security fix
// found alongside this: TenantRoleService.createCustomRole previously did an
// unrestricted Permission.valueOf(name), so a tenant admin could grant
// themselves PLATFORM_ADMIN/TENANT_MANAGE/IMPERSONATE_USER etc. via a custom
// role -- a privilege escalation into Bongo's platform-internal permissions.
// Those 5 platform-only permissions are intentionally excluded from the UI
// registry, so this can only be tested by bypassing the UI with a direct
// GraphQL call through the app's own /api/graphql proxy (same-origin, using
// the already-authenticated session cookie -- the proxy 403s any request
// missing a matching Origin/Referer header, see src/lib/security/origin.ts).
//
// Needs cypress.env.json with "tenant" user and both backend/frontend
// running.

const RUN_ID = Date.now();

// Must match every group title in permission-registry.ts's permissionGroups.
const PERMISSION_GROUP_TITLES = [
  "User & access",
  "Center setup",
  "Academics",
  "Students",
  "Communication",
  "Finance",
  "HR & staff",
  "Reporting & audit",
];

const openDialog = () => cy.get('[role="dialog"]').filter(":visible").first();

describe("Tenant setup — center, branches, calendar, org structure, roles", () => {
  it("admin: edits center profile and tenant legal information", () => {
    cy.loginByRole("tenant");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "UpdateCenter") req.alias = "updateCenter";
      if (req.body?.operationName === "UpdateTenant") req.alias = "updateTenant";
    });
    cy.visit("/dashboard/tenant-setup/center-profile");

    const tagline = `Cypress tagline ${RUN_ID}`;
    cy.contains("Center profile").parents(".MuiPaper-root").first().within(() => {
      cy.contains("button", "Edit").click();
    });
    openDialog().within(() => {
      cy.contains("label", "Tagline").parent().find("input").clear().type(tagline);
      cy.contains("button", "Save changes").click();
    });
    cy.wait("@updateCenter");
    cy.contains(tagline).should("exist");

    const contactName = `Cypress Contact ${RUN_ID}`;
    cy.contains("Legal and business information").parents(".MuiPaper-root").first().within(() => {
      cy.contains("button", "Edit").click();
    });
    openDialog().within(() => {
      cy.contains("label", "Contact person").parent().find("input").clear().type(contactName);
      cy.contains("button", "Save changes").click();
    });
    cy.wait("@updateTenant");
    cy.contains(contactName).should("exist");
  });

  it("admin: creates a branch, edits it, then deactivates it", () => {
    cy.loginByRole("tenant");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "CreateBranch") req.alias = "createBranch";
      if (req.body?.operationName === "UpdateBranch") req.alias = "updateBranch";
      if (req.body?.operationName === "DeactivateBranch") req.alias = "deactivateBranch";
    });
    cy.visit("/dashboard/tenant-setup/branches");

    const branchName = `Cypress Branch ${RUN_ID}`;
    cy.contains("button", "Add Branch").click();
    openDialog().within(() => {
      cy.contains("label", "Branch name").parent().find("input").type(branchName);
      cy.contains("label", "Address").parent().find("input").type("123 Test Road");
      cy.contains("button", "Create Branch").click();
    });
    cy.wait("@createBranch");
    cy.contains("tr", branchName).should("exist");

    cy.contains("tr", branchName).scrollIntoView().find("button").eq(0).click({ force: true });
    openDialog().within(() => {
      cy.contains("label", "Address").parent().find("input").clear().type("456 Updated Road");
      cy.contains("button", "Save Changes").click();
    });
    cy.wait("@updateBranch");
    cy.contains("tr", branchName).should("contain", "456 Updated Road");

    cy.contains("tr", branchName).scrollIntoView().find("button").eq(1).click({ force: true });
    cy.get('[role="dialog"]').filter(":visible").within(() => {
      cy.contains("button", "Deactivate").click();
    });
    cy.wait("@deactivateBranch");
    cy.contains("tr", branchName).should("contain", "Inactive");
  });

  it("admin: adds a holiday to the calendar", () => {
    cy.loginByRole("tenant");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "CreateHoliday") req.alias = "createHoliday";
    });
    cy.visit("/dashboard/tenant-setup/calendar");

    const holidayName = `Cypress Holiday ${RUN_ID}`;
    const today = new Date().toISOString().slice(0, 10);

    cy.contains("button", "Add holiday").click();
    openDialog().within(() => {
      cy.contains("label", "Holiday name *").parent().find("input").type(holidayName);
      cy.contains("label", "Date *").parent().find("input").type(today);
      cy.contains("button", "Add holiday").click();
    });
    cy.wait("@createHoliday");
    cy.contains(holidayName).should("exist");
  });

  it("admin: creates a department, then edits it", () => {
    cy.loginByRole("tenant");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "CreateDepartment") req.alias = "createDepartment";
      if (req.body?.operationName === "UpdateDepartment") req.alias = "updateDepartment";
    });
    cy.visit("/dashboard/tenant-setup/org-hierarchy");

    const deptName = `Cypress Dept ${RUN_ID}`;
    const deptCode = `CY${RUN_ID.toString().slice(-6)}`;

    cy.contains("button", "New department").click();
    openDialog().within(() => {
      cy.contains("label", "Department name").parent().find("input").type(deptName);
      cy.contains("label", "Code").parent().find("input").type(deptCode);
      cy.contains("button", "Create").click();
    });
    cy.wait("@createDepartment");
    cy.contains("tr", deptName).should("exist");

    const description = `Updated via Cypress ${RUN_ID}`;
    cy.contains("tr", deptName).scrollIntoView().find("button").click({ force: true });
    openDialog().within(() => {
      cy.contains("label", "Description").parent().find("textarea").first().clear().type(description);
      cy.contains("button", "Save changes").click();
    });
    cy.wait("@updateDepartment");
    cy.contains("tr", deptName).should("contain", description);
  });

  it("admin: creates a custom role and assigns it to an employee", () => {
    cy.loginByRole("tenant");
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.operationName === "CreateCustomRole") req.alias = "createRole";
      if (req.body?.operationName === "AssignRoleToUser") req.alias = "assignRole";
    });
    cy.visit("/dashboard/tenant-setup/roles");

    const roleName = `Cypress Role ${RUN_ID}`;

    cy.contains('[role="tab"]', /Roles/).click();
    cy.contains("button", "Create custom role").click();
    openDialog().within(() => {
      cy.get('input[placeholder="e.g. Batch coordinator"]').type(roleName);

      // Visits every group in the left sidebar and clicks "Grant all" for
      // each, one at a time. This is the actual regression guard for the
      // permission-registry.ts bug: each group's permission values are
      // submitted to createCustomRole, which does Permission.valueOf(name)
      // server-side with no fallback -- a single wrong/stale name in ANY
      // group throws immediately and this test fails, unlike the previous
      // version of this test which only ever exercised the first group.
      PERMISSION_GROUP_TITLES.forEach((title) => {
        cy.contains(title).click();
        cy.contains("button", "Grant all").click();
      });

      // 53 = every Permission enum value except the 5 platform-only ones
      // (PLATFORM_ADMIN, TENANT_MANAGE, BILLING_MANAGE,
      // SUPPORT_TICKET_MANAGE, IMPERSONATE_USER), which are intentionally
      // excluded from this registry -- see the security test below. Update
      // this count if permission-registry.ts's option list changes.
      cy.contains("total permissions").parent().should("contain", "53");

      cy.contains("button", "Create role").click();
    });
    cy.wait("@createRole");
    cy.contains(roleName).should("exist");

    cy.contains('[role="tab"]', /Employees/).click();
    cy.get("table tbody tr")
      .filter((_, el) => !Cypress.$(el).find("button").first().prop("disabled"))
      .first()
      .find("button")
      .eq(0)
      .click({ force: true });

    openDialog().within(() => {
      cy.contains("label", "Role").parent().find('[role="combobox"]').click();
    });
    cy.get('[role="option"]').contains(roleName).click();
    cy.get('[role="dialog"]').filter(":visible").within(() => {
      cy.contains("button", "Assign role").click();
    });
    cy.wait("@assignRole");
  });

  it("backend: rejects platform-only permissions in custom role creation", () => {
    // Regression test for the privilege-escalation gap found alongside the
    // permission-registry.ts bug: TenantRoleService.createCustomRole used to
    // do an unrestricted Permission.valueOf(name), so nothing stopped a
    // tenant admin from granting themselves e.g. PLATFORM_ADMIN via a custom
    // role. The UI can no longer send this (those 5 permissions aren't in
    // the registry), so this bypasses the UI entirely with a direct
    // GraphQL call through the app's own same-origin /api/graphql proxy,
    // using the session cookie cy.loginByRole already established. The
    // proxy 403s any request without a matching Origin/Referer header
    // (src/lib/security/origin.ts), so that header is set explicitly here.
    cy.loginByRole("tenant");

    cy.request({
      method: "POST",
      url: "/api/graphql",
      headers: { Origin: Cypress.config("baseUrl") ?? "" },
      failOnStatusCode: false,
      body: {
        operationName: "CreateCustomRole",
        query: `mutation CreateCustomRole($role: CreateTenantRoleInput!) {
          createCustomRole(role: $role) { id name permissions }
        }`,
        variables: {
          role: {
            name: `Cypress PrivEsc ${RUN_ID}`,
            permissions: ["PLATFORM_ADMIN"],
          },
        },
      },
    }).then((response) => {
      expect(response.body.data?.createCustomRole, "role should not be created").to.not.exist;
      expect(response.body.errors, "GraphQL error expected").to.exist;
      const message = JSON.stringify(response.body.errors);
      expect(message).to.match(/platform-level permissions/i);
    });
  });
});
