// Decides which dashboard a signed-in user lands on. Roles are free-text strings
// from the backend (e.g. STUDENT, TEACHER, CENTER_ADMIN), matched case-insensitively.
//
// Business logic, in priority order:
//   1. userType BONGO  -> /bongo/dashboard   (platform admin console)
//   2. STUDENT role    -> /student/dashboard
//   3. TEACHER role    -> /teacher/dashboard
//   4. everyone else   -> /dashboard         (center admin console)

const ADMIN_ROLE_KEYWORDS = ["admin", "owner", "principal", "director"];

// The base role every account carries. It is never the meaningful role when a
// more specific one is present.
const BASE_ROLE = "USER";

const isBaseRole = (role: string) => role.toUpperCase() === BASE_ROLE;

// Roles that actually drive routing, permissions, and display. When an account
// holds a specific role alongside the base "USER" (e.g. ["USER", "CENTER_ADMIN"]),
// "USER" is dropped and the specific role(s) win. A plain account with nothing
// but "USER" keeps it, so it still resolves to something.
export const effectiveRoles = (
  roles?: readonly string[] | null,
): string[] => {
  const all = (roles ?? []).filter(Boolean);
  const specific = all.filter((role) => !isBaseRole(role));

  return specific.length ? specific : all;
};

// The single role to show or act on. Prefers a specific role over base "USER".
export const primaryRole = (
  roles?: readonly string[] | null,
): string | null => effectiveRoles(roles)[0] ?? null;

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

// HR staff. The backend role string isn't fixed yet, so match the common forms:
// "HR", "HR_MANAGER", "HR_ADMIN", or anything containing "HUMAN_RESOURCE".
export const isHrRole = (roles?: readonly string[] | null) =>
  (roles ?? []).some((r) => {
    const u = r.toUpperCase();
    return u === "HR" || u.startsWith("HR_") || u.includes("HUMAN_RESOURCE");
  });

// The center admin owns tenant setup (center details, branches, calendar, org
// structure, roles). Gated strictly on the CENTER_ADMIN role, not the broader
// admin keyword match.
export const isCenterAdmin = (roles?: readonly string[] | null) =>
  hasRole(roles, "CENTER_ADMIN");

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
  // HR staff who are not also admins land on the dedicated HR portal.
  if (isHrRole(me.roles) && !isAdminRole(me.roles)) return "/hr/dashboard";
  return "/dashboard";
};
