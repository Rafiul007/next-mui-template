// Role helpers used to decide which dashboard a signed-in user lands on.
// Roles are free-text strings from the backend (e.g. CENTER_ADMIN, TEACHER),
// so detection is keyword based and case-insensitive.

const ADMIN_ROLE_KEYWORDS = ["admin", "owner", "principal", "director"];
const TEACHER_ROLE_KEYWORDS = ["teacher", "instructor", "faculty"];

const matches = (roles: readonly string[] | null | undefined, keywords: string[]) =>
  (roles ?? []).some((role) =>
    keywords.some((kw) => role.toLowerCase().includes(kw)),
  );

export const isAdminRole = (roles?: readonly string[] | null) =>
  matches(roles, ADMIN_ROLE_KEYWORDS);

export const isTeacherRole = (roles?: readonly string[] | null) =>
  matches(roles, TEACHER_ROLE_KEYWORDS);

// A "teacher-only" user teaches but holds no admin/owner role, so they belong in
// the teacher dashboard rather than the full admin console.
export const isTeacherOnly = (roles?: readonly string[] | null) =>
  isTeacherRole(roles) && !isAdminRole(roles);

export const isStudentRole = (roles?: readonly string[] | null) =>
  matches(roles, ["student"]);

type MeLike = {
  userType?: string | null;
  roles?: readonly string[] | null;
} | null | undefined;

// Single source of truth for the post-login landing path. Every auth guard
// must redirect through this function so they all agree on where a given
// user belongs — otherwise mismatched guards can bounce a user back and
// forth between two routes forever.
export const resolveHomePath = (me: MeLike): string => {
  if (!me) return "/dashboard";
  if (me.userType === "BONGO") return "/bongo/dashboard";
  if (isTeacherOnly(me.roles)) return "/teacher/dashboard";
  if (isStudentRole(me.roles)) return "/student/dashboard";
  return "/dashboard";
};
