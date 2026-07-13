/// <reference types="cypress" />

// Pure-logic tests for the post-login routing rules. No backend or app server
// needed — these exercise the single source of truth in src/lib/auth/roles.ts
// directly, so they stay green even when cypress.env.json has no live accounts.
// Relative import (not "@/") because the Cypress bundler doesn't read tsconfig paths.
import {
  accessibleDashboardKeys,
  effectiveRoles,
  isCenterAdmin,
  isStudent,
  isStudentRole,
  isTeacher,
  isTeacherRole,
  primaryRole,
  resolveHomePath,
} from "../../src/lib/auth/roles";

describe("auth role routing", () => {
  describe("resolveHomePath", () => {
    it("sends BONGO platform admins to the bongo console", () => {
      expect(resolveHomePath({ userType: "BONGO", roles: ["ADMIN"] })).to.eq(
        "/bongo/dashboard",
      );
    });

    it("sends STUDENT role to the student portal", () => {
      expect(resolveHomePath({ roles: ["STUDENT"] })).to.eq("/student/dashboard");
    });

    it("sends TEACHER role to the teacher console", () => {
      expect(resolveHomePath({ roles: ["TEACHER"] })).to.eq("/teacher/dashboard");
    });

    it("sends HEAD_TEACHER role to the teacher console", () => {
      expect(resolveHomePath({ roles: ["HEAD_TEACHER"] })).to.eq(
        "/teacher/dashboard",
      );
    });

    it("sends a multi-dashboard user to the picker", () => {
      expect(
        resolveHomePath({ roles: ["TEACHER", "CENTER_ADMIN"] }),
      ).to.eq("/select-dashboard");
    });

    it("sends center admins / everyone else to /dashboard", () => {
      expect(resolveHomePath({ roles: ["CENTER_ADMIN"] })).to.eq("/dashboard");
    });

    it("defaults an absent identity to /dashboard", () => {
      expect(resolveHomePath(null)).to.eq("/dashboard");
      expect(resolveHomePath(undefined)).to.eq("/dashboard");
    });

    it("lets BONGO userType win over any role", () => {
      expect(
        resolveHomePath({ userType: "BONGO", roles: ["STUDENT"] }),
      ).to.eq("/bongo/dashboard");
    });

    // Regression: the legacy "USER" alias was dropped. A bare USER role is no
    // longer a student and must fall through to the center-admin dashboard.
    it("no longer treats the legacy USER role as a student", () => {
      expect(resolveHomePath({ roles: ["USER"] })).to.eq("/dashboard");
    });
  });

  describe("isTeacherRole", () => {
    it("matches TEACHER and HEAD_TEACHER case-insensitively", () => {
      expect(isTeacherRole(["TEACHER"])).to.be.true;
      expect(isTeacherRole(["head_teacher"])).to.be.true;
      expect(isTeacherRole(["USER", "HEAD_TEACHER"])).to.be.true;
    });

    it("rejects non-teacher roles and empty/absent sets", () => {
      expect(isTeacherRole(["STUDENT"])).to.be.false;
      expect(isTeacherRole([])).to.be.false;
      expect(isTeacherRole(null)).to.be.false;
    });
  });

  describe("accessibleDashboardKeys", () => {
    it("returns a single home for a single-role user", () => {
      expect(accessibleDashboardKeys({ roles: ["TEACHER"] })).to.deep.eq([
        "teacher",
      ]);
    });

    it("lists genuine memberships for a multi-role user", () => {
      expect(
        accessibleDashboardKeys({ roles: ["TEACHER", "CENTER_ADMIN"] }),
      ).to.deep.eq(["teacher", "centerAdmin"]);
    });

    it("gives a BONGO admin only the bongo console, ignoring tenant roles", () => {
      expect(
        accessibleDashboardKeys({ userType: "BONGO", roles: ["TEACHER"] }),
      ).to.deep.eq(["bongo"]);
    });

    it("keeps HR out of a center admin's memberships (supervisory access only)", () => {
      expect(accessibleDashboardKeys({ roles: ["CENTER_ADMIN"] })).to.deep.eq([
        "centerAdmin",
      ]);
    });
  });

  describe("isStudentRole", () => {
    it("matches STUDENT case-insensitively", () => {
      expect(isStudentRole(["student"])).to.be.true;
      expect(isStudentRole(["STUDENT", "GUARDIAN"])).to.be.true;
    });

    it("rejects the legacy USER role and empty/absent roles", () => {
      expect(isStudentRole(["USER"])).to.be.false;
      expect(isStudentRole([])).to.be.false;
      expect(isStudentRole(null)).to.be.false;
      expect(isStudentRole(undefined)).to.be.false;
    });
  });

  describe("effectiveRoles / primaryRole", () => {
    it("drops the base USER role when a specific role is present", () => {
      expect(effectiveRoles(["USER", "CENTER_ADMIN"])).to.deep.eq([
        "CENTER_ADMIN",
      ]);
      expect(primaryRole(["USER", "CENTER_ADMIN"])).to.eq("CENTER_ADMIN");
    });

    it("is order-independent when stripping USER", () => {
      expect(primaryRole(["CENTER_ADMIN", "USER"])).to.eq("CENTER_ADMIN");
    });

    it("keeps USER when it is the only role", () => {
      expect(effectiveRoles(["USER"])).to.deep.eq(["USER"]);
      expect(primaryRole(["USER"])).to.eq("USER");
    });

    it("returns null primary role for an empty/absent set", () => {
      expect(primaryRole([])).to.eq(null);
      expect(primaryRole(null)).to.eq(null);
    });

    it("routes a USER + staff account by the specific role, not USER", () => {
      expect(resolveHomePath({ roles: ["USER", "CENTER_ADMIN"] })).to.eq(
        "/dashboard",
      );
      expect(resolveHomePath({ roles: ["USER", "TEACHER"] })).to.eq(
        "/teacher/dashboard",
      );
    });
  });

  describe("isCenterAdmin (tenant Profile Setup access)", () => {
    it("grants only the CENTER_ADMIN role, case-insensitively", () => {
      expect(isCenterAdmin(["CENTER_ADMIN"])).to.be.true;
      expect(isCenterAdmin(["USER", "center_admin"])).to.be.true;
    });

    it("denies teachers, students, other admins, and empty sets", () => {
      expect(isCenterAdmin(["TEACHER"])).to.be.false;
      expect(isCenterAdmin(["STUDENT"])).to.be.false;
      expect(isCenterAdmin(["BRANCH_ADMIN"])).to.be.false;
      expect(isCenterAdmin(["USER"])).to.be.false;
      expect(isCenterAdmin([])).to.be.false;
      expect(isCenterAdmin(null)).to.be.false;
    });
  });

  describe("isStudent / isTeacher guards", () => {
    it("classifies a STUDENT identity as a student, not a teacher", () => {
      const me = { roles: ["STUDENT"] };
      expect(isStudent(me)).to.be.true;
      expect(isTeacher(me)).to.be.false;
    });

    it("does not classify a USER identity as a student", () => {
      expect(isStudent({ roles: ["USER"] })).to.be.false;
    });

    it("treats a null identity as neither", () => {
      expect(isStudent(null)).to.be.false;
      expect(isTeacher(null)).to.be.false;
    });
  });
});
