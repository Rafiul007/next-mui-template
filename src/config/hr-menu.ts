import type { ElementType } from "react";
import {
  AccountBalanceWalletRounded,
  AssessmentRounded,
  AssignmentLateRounded,
  BeachAccessRounded,
  DashboardRounded,
  FactCheckRounded,
  PaymentsRounded,
  PeopleRounded,
  PolicyRounded,
  PsychologyRounded,
  WorkRounded,
} from "@mui/icons-material";

export type HrSidebarSubMenuItem = {
  key: string;
  label: string;
  href?: string;
  icon?: ElementType;
  status?: "active" | "planned";
};

export type HrSidebarMenuItem = {
  key: string;
  label: string;
  href?: string;
  icon: ElementType;
  status?: "active" | "planned";
  children?: HrSidebarSubMenuItem[];
};

const buildHrHref = (segments?: string[]) => {
  if (!segments) return undefined;
  return segments.length
    ? `/hr/dashboard/${segments.join("/")}`
    : "/hr/dashboard";
};

export const hrSidebarMenuItems: HrSidebarMenuItem[] = [
  {
    key: "overview",
    label: "Overview",
    icon: DashboardRounded,
    href: buildHrHref([]),
    status: "active",
  },
  {
    key: "employees",
    label: "Staff Directory",
    icon: PeopleRounded,
    href: buildHrHref(["employees"]),
    status: "active",
  },
  {
    key: "attendance",
    label: "Staff Attendance",
    icon: FactCheckRounded,
    href: buildHrHref(["attendance"]),
    status: "active",
  },
  {
    key: "leave",
    label: "Leave Management",
    icon: BeachAccessRounded,
    href: buildHrHref(["leave"]),
    status: "active",
  },
  {
    key: "leave-policy",
    label: "Leave Policies",
    icon: PolicyRounded,
    href: buildHrHref(["leave-policy"]),
    status: "active",
  },
  {
    key: "payroll",
    label: "Payroll",
    icon: PaymentsRounded,
    href: buildHrHref(["payroll"]),
    status: "active",
  },
  {
    key: "my-payroll",
    label: "My Payroll",
    icon: AccountBalanceWalletRounded,
    href: buildHrHref(["my-payroll"]),
    status: "active",
  },
  {
    key: "performance",
    label: "Performance",
    icon: AssessmentRounded,
    href: buildHrHref(["performance"]),
    status: "active",
  },
  {
    key: "recruitment",
    label: "Recruitment",
    icon: WorkRounded,
    href: buildHrHref(["recruitment"]),
    status: "active",
  },
  {
    key: "pip",
    label: "Improvement Plans",
    icon: AssignmentLateRounded,
    href: buildHrHref(["pip"]),
    status: "active",
  },
  {
    key: "skills",
    label: "Skills Matrix",
    icon: PsychologyRounded,
    href: buildHrHref(["skills"]),
    status: "active",
  },
];
