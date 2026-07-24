import type { ElementType } from "react";
import {
  AccountBalanceWalletRounded,
  AccountTreeRounded,
  AdminPanelSettingsRounded,
  AnnouncementRounded,
  AssessmentRounded,
  AutoStoriesRounded,
  BadgeRounded,
  BeachAccessRounded,
  BusinessRounded,
  CalendarMonthRounded,
  CampaignRounded,
  CorporateFareRounded,
  DashboardRounded,
  DescriptionRounded,
  EmojiEventsRounded,
  EventAvailableRounded,
  EventNoteRounded,
  DateRangeRounded,
  FactCheckRounded,
  FolderOpenRounded,
  GroupsRounded,
  HowToRegRounded,
  LibraryBooksRounded,
  LocalOfferRounded,
  MonetizationOnRounded,
  PaymentsRounded,
  PeopleRounded,
  PolicyRounded,
  PriceCheckRounded,
  ReceiptLongRounded,
  SchoolRounded,
  StorefrontRounded,
} from "@mui/icons-material";

export type SidebarSubMenuItem = {
  key: string;
  label: string;
  href?: string;
  icon?: ElementType;
  useCases?: string[];
  status?: "active" | "planned";
};

export type SidebarMenuItem = {
  key: string;
  label: string;
  href?: string;
  icon: ElementType;
  phase?: string;
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
  useCases,
  route,
  icon,
  status = "planned",
}: MenuModuleInput): SidebarSubMenuItem => ({
  key,
  label,
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
  href: children?.length ? undefined : buildDashboardHref(route),
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
      label: "Profile Setup",
      icon: BusinessRounded,
      phase: "Phase 2",
      route: ["tenant-setup"],
      children: [
        {
          key: "center-profile",
          label: "Center Details",
          icon: CorporateFareRounded,
          useCases: ["UC-CA-01", "UC-CA-10"],
          route: ["tenant-setup", "center-profile"],
        },
        {
          key: "branch-management",
          icon: StorefrontRounded,
          label: "Branches",
          useCases: ["UC-BM-01"],
          route: ["tenant-setup", "branches"],
        },
        {
          key: "holiday-calendar",
          label: "Calendar & Holidays",
          route: ["tenant-setup", "calendar"],
          icon: CalendarMonthRounded,
          status: "active",
        },
        {
          key: "org-hierarchy",
          label: "Organization Structure",
          route: ["tenant-setup", "org-hierarchy"],
          icon: AccountTreeRounded,
          status: "active",
        },
        {
          key: "tenant-roles",
          label: "Roles & Permissions",
          route: ["tenant-setup", "roles"],
          icon: AdminPanelSettingsRounded,
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
          icon: LibraryBooksRounded,
          useCases: ["UC-HT-01", "UC-HT-06"],
          route: ["academic", "catalog"],
          status: "active",
        },
        {
          key: "batch-management",
          label: "Batches",
          icon: GroupsRounded,
          route: ["academic", "batches"],
          status: "active",
        },
        {
          key: "session-scheduling",
          label: "Class Schedule",
          icon: EventNoteRounded,
          route: ["academic", "sessions"],
          status: "active",
        },
        {
          key: "class-routine",
          label: "Class Routine",
          icon: DateRangeRounded,
          route: ["academic", "routine"],
          status: "active",
        },
        {
          key: "study-materials",
          label: "Materials & Homework",
          icon: FolderOpenRounded,
          useCases: ["UC-TC-01", "UC-TC-14"],
          route: ["academic", "materials"],
          status: "active",
        },
        {
          key: "exams-results",
          label: "Exams & Results",
          route: ["academic", "exams"],
          icon: AssessmentRounded,
          status: "active",
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
          icon: HowToRegRounded,
          route: ["students", "profiles"],
          status: "active",
        },
        {
          key: "student-attendance",
          label: "Attendance",
          icon: EventAvailableRounded,
          route: ["students", "attendance"],
          status: "active",
        },
      ],
    }),
    createSection({
      key: "fee-payment",
      label: "Billing & Payments",
      icon: PaymentsRounded,
      phase: "Phase 5",
      status: "active",
      children: [
        {
          key: "bills-and-invoices",
          label: "Bills & Invoices",
          icon: DescriptionRounded,
          route: ["fees", "invoices"],
          status: "active",
        },
        {
          key: "academic-transactions",
          label: "Academic Fees",
          icon: PriceCheckRounded,
          route: ["fees", "academic-fees"],
          status: "active",
        },
        {
          key: "discounts",
          label: "Discounts",
          icon: LocalOfferRounded,
          route: ["fees", "discounts"],
          status: "active",
        },
        {
          key: "payment-collection",
          label: "Collections",
          icon: AccountBalanceWalletRounded,
          route: ["fees", "payments"],
          status: "active",
        },
        {
          key: "transactions",
          label: "Transactions",
          icon: ReceiptLongRounded,
          route: ["fees", "transactions"],
          status: "active",
        },
      ],
    }),
    createSection({
      key: "hr-module",
      label: "Staff & HR",
      icon: BadgeRounded,
      phase: "Phase 6",
      route: ["hr"],
      status: "active",
      children: [
        {
          key: "employee-profile",
          label: "Staff Directory",
          icon: PeopleRounded,
          route: ["hr", "employees"],
          status: "active",
        },
        {
          key: "leave-management",
          label: "Leave Management",
          icon: BeachAccessRounded,
          route: ["hr", "leave"],
          status: "active",
        },
        {
          key: "employee-attendance",
          label: "Staff Attendance",
          icon: FactCheckRounded,
          route: ["hr", "attendance"],
          status: "active",
        },
        {
          key: "leave-policy",
          label: "Leave Policies",
          icon: PolicyRounded,
          route: ["hr", "leave-policy"],
          status: "active",
        },
        {
          key: "payroll",
          label: "Payroll",
          icon: MonetizationOnRounded,
          route: ["hr", "payroll"],
          status: "active",
        },
      ],
    }),
    createSection({
      key: "communications",
      label: "Communications",
      icon: AnnouncementRounded,
      phase: "Phase 7",
      route: ["notices"],
      status: "active",
      children: [
        {
          key: "notice-board",
          label: "Notice Board",
          icon: CampaignRounded,
          route: ["notices"],
          status: "active",
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
      eyebrow: match.section.label,
      title: `${match.module.label} is coming soon`,
      description:
        "This module is available in the navigation, but the working screen is still under construction.",
    };
  }

  return null;
};
