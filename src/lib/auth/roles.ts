// Single source of truth for role-based dashboard access. Kept dependency-free
// (no React/MUI imports) so Cypress can import it directly for pure-logic tests.
//
// Two ideas drive everything here:
//   - "membership"  -> a dashboard is a *home* for the user (drives routing, the
//     login picker, and the switcher).
//   - "access"      -> a guard lets the user in. Usually the same as membership,
//     but a few dashboards allow supervisors in without it being their home.
//
// To grant a role access to a dashboard, add the role string to that dashboard's
// array below. That is the only edit needed for the common case.

// ---------------------------------------------------------------------------
// Role arrays — the knobs. Add a role string here to grant access.
// ---------------------------------------------------------------------------

export const STUDENT_ROLES = ["STUDENT"] as const;
export const TEACHER_ROLES = ["TEACHER", "HEAD_TEACHER"] as const;
export const CENTER_ADMIN_ROLES = ["CENTER_ADMIN"] as const;

// Exact HR role strings. The backend HR role isn't finalized, so isHrRole() also
// matches the "HR_*" / "HUMAN_RESOURCE" shapes below — add exact strings here.
export const HR_ROLES = ["HR"] as const;

// Any role whose name contains one of these keywords counts as an admin. Broader
// than CENTER_ADMIN so branch/owner/principal accounts resolve to the console.
const ADMIN_ROLE_KEYWORDS = ["admin", "owner", "principal", "director"];

// The base role every account carries. Never the meaningful role when a more
// specific one is present.
const BASE_ROLE = "USER";

const isBaseRole = (role: string) => role.toUpperCase() === BASE_ROLE;

// ---------------------------------------------------------------------------
// Role helpers
// ---------------------------------------------------------------------------

const hasRole = (roles: readonly string[] | null | undefined, role: string) =>
  (roles ?? []).some((r) => r.toUpperCase() === role.toUpperCase());

// True when the user holds any role from the given allow-list.
const hasAnyRole = (
  roles: readonly string[] | null | undefined,
  allowed: readonly string[],
) => allowed.some((role) => hasRole(roles, role));

const matchesKeyword = (
  roles: readonly string[] | null | undefined,
  keywords: string[],
) =>
  (roles ?? []).some((role) =>
    keywords.some((kw) => role.toLowerCase().includes(kw)),
  );

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

export const isAdminRole = (roles?: readonly string[] | null) =>
  matchesKeyword(roles, ADMIN_ROLE_KEYWORDS);

// Students carry the STUDENT role. (The old "USER" alias was dropped once the
// backend started issuing STUDENT for student accounts.)
export const isStudentRole = (roles?: readonly string[] | null) =>
  hasAnyRole(roles, STUDENT_ROLES);

export const isTeacherRole = (roles?: readonly string[] | null) =>
  hasAnyRole(roles, TEACHER_ROLES);

// HR staff. The backend role string isn't fixed yet, so match the exact HR_ROLES
// plus the common forms: "HR_MANAGER", "HR_ADMIN", or anything with "HUMAN_RESOURCE".
export const isHrRole = (roles?: readonly string[] | null) =>
  hasAnyRole(roles, HR_ROLES) ||
  (roles ?? []).some((r) => {
    const u = r.toUpperCase();
    return u.startsWith("HR_") || u.includes("HUMAN_RESOURCE");
  });

// The center admin owns tenant setup (center details, branches, calendar, org
// structure, roles). Gated strictly on the CENTER_ADMIN role, not the broader
// admin keyword match.
export const isCenterAdmin = (roles?: readonly string[] | null) =>
  hasAnyRole(roles, CENTER_ADMIN_ROLES);

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

// The `me.permissions[].resource` list carries the exact backend Permission
// enum strings (e.g. "HR_PAYROLL_APPROVE") — this checks membership directly,
// no keyword or role-name guessing needed. Use this to gate actions/buttons
// that a backend @RequiresPermission also checks, so the UI and API agree.
export const hasPermission = (
  permissions: readonly { resource: string }[] | null | undefined,
  resource: string,
): boolean => (permissions ?? []).some((p) => p.resource === resource);

export const isStudent = (me: MeLike): boolean =>
  !!me && isStudentRole(me.roles);

export const isTeacher = (me: MeLike): boolean =>
  !!me && isTeacherRole(me.roles);

// ---------------------------------------------------------------------------
// Dashboard registry
// ---------------------------------------------------------------------------

export type DashboardKey =
  | "bongo"
  | "student"
  | "teacher"
  | "hr"
  | "centerAdmin";

export const SELECT_DASHBOARD_PATH = "/select-dashboard";
const FALLBACK_PATH = "/dashboard";

type DashboardRoute = {
  key: DashboardKey;
  path: string;
  // This dashboard is a home for the user (drives routing + picker + switcher).
  isMember: (me: NonNullable<MeLike>) => boolean;
  // A guard lets the user in. Defaults to isMember when omitted.
  canAccess?: (me: NonNullable<MeLike>) => boolean;
};

// Ordered by routing priority. BONGO is handled separately (see below) so it is
// listed first but never mixes with tenant memberships.
const DASHBOARD_ROUTES: DashboardRoute[] = [
  {
    key: "bongo",
    path: "/bongo/dashboard",
    isMember: (me) => me.userType === "BONGO",
  },
  {
    key: "student",
    path: "/student/dashboard",
    isMember: (me) => isStudentRole(me.roles),
  },
  {
    key: "teacher",
    path: "/teacher/dashboard",
    isMember: (me) => isTeacherRole(me.roles),
  },
  {
    key: "hr",
    path: "/hr/dashboard",
    // Pure HR staff live here. Center/admin supervisors can open it (canAccess)
    // but it is not their home, so it stays out of their picker.
    isMember: (me) => isHrRole(me.roles) && !isAdminRole(me.roles),
    canAccess: (me) =>
      isHrRole(me.roles) || isCenterAdmin(me.roles) || isAdminRole(me.roles),
  },
  {
    key: "centerAdmin",
    path: FALLBACK_PATH,
    isMember: (me) => isCenterAdmin(me.roles) || isAdminRole(me.roles),
  },
];

const routeFor = (key: DashboardKey) =>
  DASHBOARD_ROUTES.find((route) => route.key === key)!;

// The dashboards a user is a genuine member of, in priority order. A BONGO
// platform admin only ever gets the bongo console — tenant roles are ignored so
// they never see a tenant picker.
export const accessibleDashboardKeys = (me: MeLike): DashboardKey[] => {
  if (!me) return [];
  if (me.userType === "BONGO") return ["bongo"];

  return DASHBOARD_ROUTES.filter(
    (route) => route.key !== "bongo" && route.isMember(me),
  ).map((route) => route.key);
};

export const pathForDashboard = (key: DashboardKey): string =>
  routeFor(key).path;

// Whether a guard should let this user into the given dashboard.
export const dashboardCanAccess = (me: MeLike, key: DashboardKey): boolean => {
  if (!me) return false;
  const route = routeFor(key);
  const allowed = route.canAccess ?? route.isMember;
  if (allowed(me)) return true;

  // The center-admin console doubles as the catch-all: a user who is a member of
  // no dashboard (e.g. a bare USER) still belongs here.
  if (key === "centerAdmin") return accessibleDashboardKeys(me).length === 0;

  return false;
};

// Match a pathname to the dashboard it belongs to (longest path prefix wins so
// nested routes like /teacher/dashboard/leave resolve correctly).
export const dashboardKeyForPath = (
  pathname: string | null | undefined,
): DashboardKey | null => {
  if (!pathname) return null;

  return (
    [...DASHBOARD_ROUTES]
      .sort((a, b) => b.path.length - a.path.length)
      .find(
        (route) =>
          pathname === route.path || pathname.startsWith(`${route.path}/`),
      )?.key ?? null
  );
};

// Single source of truth for the post-login landing path. Every auth guard must
// redirect through this function so they all agree on where a given user
// belongs — otherwise mismatched guards can bounce a user back and forth between
// two routes forever. A user who belongs to more than one dashboard is sent to
// the picker so they choose.
export const resolveHomePath = (me: MeLike): string => {
  if (!me) return FALLBACK_PATH;

  const keys = accessibleDashboardKeys(me);
  if (keys.length === 0) return FALLBACK_PATH;
  if (keys.length === 1) return pathForDashboard(keys[0]);
  return SELECT_DASHBOARD_PATH;
};
