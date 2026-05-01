import type { ElementType } from "react";
import {
  AccountTreeRounded,
  ApartmentRounded,
  AutoStoriesRounded,
  BadgeRounded,
  CalendarMonthRounded,
  DashboardRounded,
  PaymentsRounded,
  SchoolRounded,
  SettingsRounded,
} from "@mui/icons-material";

export type SidebarSubMenuItem = {
  key: string;
  label: string;
  href?: string;
  icon?: ElementType;
  moduleCode?: string;
  useCases?: string[];
  status?: "active" | "planned";
};

export type SidebarMenuItem = {
  key: string;
  label: string;
  href?: string;
  icon: ElementType;
  phase?: string;
  moduleCode?: string;
  useCases?: string[];
  status?: "active" | "planned";
  children?: SidebarSubMenuItem[];
};

export type DashboardPlaceholderContent = {
  eyebrow: string;
  title: string;
  description: string;
};

type MenuModuleInput = {
  key: string;
  label: string;
  moduleCode: string;
  useCases?: string[];
  route?: string[];
  icon?: ElementType;
  status?: "active" | "planned";
};

type MenuSectionInput = {
  key: string;
  label: string;
  icon: ElementType;
  phase?: string;
  route?: string[];
  status?: "active" | "planned";
  children?: MenuModuleInput[];
};

const buildDashboardHref = (segments?: string[]) => {
  if (!segments) {
    return undefined;
  }

  return segments.length ? `/dashboard/${segments.join("/")}` : "/dashboard";
};

const createModule = ({
  key,
  label,
  moduleCode,
  useCases,
  route,
  icon,
  status = "planned",
}: MenuModuleInput): SidebarSubMenuItem => ({
  key,
  label,
  moduleCode,
  useCases,
  icon,
  status,
  href: buildDashboardHref(route),
});

const createSection = ({
  key,
  label,
  icon,
  phase,
  route,
  status = "planned",
  children,
}: MenuSectionInput): SidebarMenuItem => ({
  key,
  label,
  icon,
  phase,
  status,
  href: buildDashboardHref(route),
  children: children?.map(createModule),
});

export const dashboardMenuMap = {
  overview: createSection({
    key: "overview",
    label: "Dashboard",
    icon: DashboardRounded,
    route: [],
    status: "active",
  }),
  phases: [
    createSection({
      key: "tenant-setup",
      label: "Center Setup",
      icon: ApartmentRounded,
      phase: "Phase 2",
      route: ["tenant-setup"],
      children: [
        {
          key: "center-profile",
          label: "Center Details",
          moduleCode: "2.1",
          useCases: ["UC-CA-01", "UC-CA-10"],
          route: ["tenant-setup", "center-profile"],
        },
        {
          key: "branch-management",
          label: "Branches",
          moduleCode: "2.2",
          useCases: ["UC-BM-01"],
          route: ["tenant-setup", "branches"],
        },
        {
          key: "holiday-calendar",
          label: "Calendar & Holidays",
          moduleCode: "2.3",
          route: ["tenant-setup", "calendar"],
          icon: CalendarMonthRounded,
        },
        {
          key: "org-hierarchy",
          label: "Teams & Structure",
          moduleCode: "2.4",
          route: ["tenant-setup", "org-hierarchy"],
          icon: AccountTreeRounded,
        },
        {
          key: "tenant-roles",
          label: "Roles & Access",
          moduleCode: "2.5",
          route: ["tenant-setup", "roles"],
          icon: SettingsRounded,
        },
      ],
    }),
    createSection({
      key: "academic-core",
      label: "Academics",
      icon: AutoStoriesRounded,
      phase: "Phase 3",
      status: "active",
      route: ["academic"],
      children: [
        {
          key: "subject-program-catalog",
          label: "Subjects & Programs",
          moduleCode: "3.1",
          useCases: ["UC-HT-01", "UC-HT-06"],
          route: ["academic", "catalog"],
        },
        {
          key: "batch-management",
          label: "Batches",
          moduleCode: "3.2",
          route: ["academic", "batches"],
        },
        {
          key: "session-scheduling",
          label: "Class Schedule",
          moduleCode: "3.3",
          route: ["academic", "sessions"],
        },
        {
          key: "study-materials",
          label: "Materials & Homework",
          moduleCode: "3.4",
          useCases: ["UC-TC-01", "UC-TC-14"],
          route: ["academic", "materials"],
        },
      ],
    }),
    createSection({
      key: "student-management",
      label: "Students",
      icon: SchoolRounded,
      phase: "Phase 4",
      route: ["students"],
      children: [
        {
          key: "student-profile",
          label: "Admissions & Profiles",
          moduleCode: "4.1",
          route: ["students", "profiles"],
        },
        {
          key: "student-enrollment",
          label: "Enrollments",
          moduleCode: "4.2",
          route: ["students", "enrollments"],
        },
        {
          key: "student-attendance",
          label: "Attendance",
          moduleCode: "4.3",
          route: ["students", "attendance"],
        },
        {
          key: "student-documents",
          label: "Documents",
          moduleCode: "4.4",
          route: ["students", "documents"],
        },
      ],
    }),
    createSection({
      key: "fee-payment",
      label: "Billing & Payments",
      icon: PaymentsRounded,
      phase: "Phase 5",
      route: ["fees"],
      children: [
        {
          key: "fee-structure",
          label: "Fee Setup",
          moduleCode: "5.1",
          route: ["fees", "structure"],
        },
        {
          key: "invoicing",
          label: "Invoices",
          moduleCode: "5.2",
          route: ["fees", "invoices"],
        },
        {
          key: "payment-collection",
          label: "Collections",
          moduleCode: "5.3",
          route: ["fees", "payments"],
        },
        {
          key: "payment-gateway",
          label: "Online Payments",
          moduleCode: "5.4",
          route: ["fees", "gateway"],
        },
      ],
    }),
    createSection({
      key: "hr-module",
      label: "Staff & HR",
      icon: BadgeRounded,
      phase: "Phase 6",
      route: ["hr"],
      children: [
        {
          key: "employee-profile",
          label: "Staff Directory",
          moduleCode: "6.1",
          route: ["hr", "employees"],
        },
        {
          key: "recruitment",
          label: "Hiring",
          moduleCode: "6.2",
          route: ["hr", "recruitment"],
        },
        {
          key: "leave-management",
          label: "Leave & Time Off",
          moduleCode: "6.3",
          route: ["hr", "leave"],
        },
        {
          key: "employee-attendance",
          label: "Staff Attendance",
          moduleCode: "6.4",
          route: ["hr", "attendance"],
        },
        {
          key: "payroll",
          label: "Payroll",
          moduleCode: "6.5",
          route: ["hr", "payroll"],
        },
        {
          key: "performance-management",
          label: "Performance Reviews",
          moduleCode: "6.6",
          route: ["hr", "performance"],
        },
      ],
    }),
  ] as SidebarMenuItem[],
};

export const dashboardSidebarMenuItems: SidebarMenuItem[] = [
  dashboardMenuMap.overview,
  ...dashboardMenuMap.phases,
];

const dashboardSectionLookup = new Map(
  dashboardSidebarMenuItems
    .filter((item) => item.href && item.href !== "/dashboard")
    .map((item) => [item.href as string, item]),
);

const dashboardModuleLookup = new Map(
  dashboardSidebarMenuItems.flatMap((item) =>
    (item.children ?? [])
      .filter((child) => child.href)
      .map((child) => [
        child.href as string,
        {
          section: item,
          module: child,
        },
      ]),
  ),
);

export const getDashboardPlaceholderContent = (
  segments: string[],
): DashboardPlaceholderContent | null => {
  const href = buildDashboardHref(segments);

  if (!href) {
    return null;
  }

  if (segments.length === 1) {
    const section = dashboardSectionLookup.get(href);

    if (!section) {
      return null;
    }

    return {
      eyebrow: section.phase ?? "Under Construction",
      title: `${section.label} is coming soon`,
      description:
        "This workspace is already mapped in the dashboard, but the page content is still being built.",
    };
  }

  if (segments.length === 2) {
    const match = dashboardModuleLookup.get(href);

    if (!match) {
      return null;
    }

    return {
      eyebrow: match.module.moduleCode
        ? `${match.section.label} • Module ${match.module.moduleCode}`
        : match.section.label,
      title: `${match.module.label} is coming soon`,
      description:
        "This module is available in the navigation, but the working screen is still under construction.",
    };
  }

  return null;
};
