import type { ElementType } from "react";
import {
  DashboardRounded,
  EventNoteRounded,
  FactCheckRounded,
  AssessmentRounded,
  BeachAccessRounded,
} from "@mui/icons-material";

export type TeacherSidebarSubMenuItem = {
  key: string;
  label: string;
  href?: string;
  icon?: ElementType;
  status?: "active" | "planned";
};

export type TeacherSidebarMenuItem = {
  key: string;
  label: string;
  href?: string;
  icon: ElementType;
  status?: "active" | "planned";
  children?: TeacherSidebarSubMenuItem[];
};

const buildTeacherHref = (segments?: string[]) => {
  if (!segments) return undefined;
  return segments.length
    ? `/teacher/dashboard/${segments.join("/")}`
    : "/teacher/dashboard";
};

export const teacherSidebarMenuItems: TeacherSidebarMenuItem[] = [
  {
    key: "overview",
    label: "Overview",
    icon: DashboardRounded,
    href: buildTeacherHref([]),
    status: "active",
  },
  {
    key: "schedule",
    label: "My Schedule",
    icon: EventNoteRounded,
    href: buildTeacherHref(["schedule"]),
    status: "active",
  },
  {
    key: "attendance",
    label: "Attendance",
    icon: FactCheckRounded,
    href: buildTeacherHref(["attendance"]),
    status: "active",
  },
  {
    key: "exams",
    label: "Exams & Results",
    icon: AssessmentRounded,
    href: buildTeacherHref(["exams"]),
    status: "active",
  },
  {
    key: "leave",
    label: "Leave",
    icon: BeachAccessRounded,
    href: buildTeacherHref(["leave"]),
    status: "active",
  },
];
