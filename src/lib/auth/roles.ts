// Decides which dashboard a signed-in user lands on. Roles are free-text strings
// from the backend (e.g. STUDENT, TEACHER, CENTER_ADMIN), matched case-insensitively.
//
// Business logic, in priority order:
//   1. userType BONGO  -> /bongo/dashboard   (platform admin console)
//   2. STUDENT role    -> /student/dashboard
//   3. TEACHER role    -> /teacher/dashboard
//   4. everyone else   -> /dashboard         (center admin console)

const ADMIN_ROLE_KEYWORDS = ["admin", "owner", "principal", "director"];

const hasRole = (roles: readonly string[] | null | undefined, role: string) =>
  (roles ?? []).some((r) => r.toUpperCase() === role.toUpperCase());

const matchesKeyword = (
  roles: readonly string[] | null | undefined,
  keywords: string[],
) =>
  (roles ?? []).some((role) =>
    keywords.some((kw) => role.toLowerCase().includes(kw)),
  );

export const isAdminRole = (roles?: readonly string[] | null) =>
  matchesKeyword(roles, ADMIN_ROLE_KEYWORDS);

// Students carry the STUDENT role. (The old "USER" alias was dropped once the
// backend started issuing STUDENT for student accounts.)
export const isStudentRole = (roles?: readonly string[] | null) =>
  hasRole(roles, "STUDENT");

export const isTeacherRole = (roles?: readonly string[] | null) =>
  hasRole(roles, "TEACHER");

// A "teacher-only" user teaches but holds no admin/owner role. Used to pick which
// "My Profile" screen to show, not for landing-page routing.
export const isTeacherOnly = (roles?: readonly string[] | null) =>
  isTeacherRole(roles) && !isAdminRole(roles);

type MeLike =
  | {
      userType?: string | null;
      roles?: readonly string[] | null;
    }
  | null
  | undefined;

export const isStudent = (me: MeLike): boolean =>
  !!me && isStudentRole(me.roles);

export const isTeacher = (me: MeLike): boolean =>
  !!me && isTeacherRole(me.roles);

// Single source of truth for the post-login landing path. Every auth guard must
// redirect through this function so they all agree on where a given user
// belongs — otherwise mismatched guards can bounce a user back and forth
// between two routes forever.
export const resolveHomePath = (me: MeLike): string => {
  if (!me) return "/dashboard";
  if (me.userType === "BONGO") return "/bongo/dashboard";
  if (isStudentRole(me.roles)) return "/student/dashboard";
  if (isTeacherRole(me.roles)) return "/teacher/dashboard";
  return "/dashboard";
};
