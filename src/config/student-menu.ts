import type { ElementType } from "react";
import {
  AssignmentRounded,
  CalendarMonthRounded,
  DashboardRounded,
  DescriptionRounded,
  EventAvailableRounded,
  FolderOpenRounded,
  LeaderboardRounded,
  NotificationsNoneRounded,
  PersonRounded,
} from "@mui/icons-material";

export type StudentMenuItem = {
  key: string;
  label: string;
  href: string;
  icon: ElementType;
};

export const studentMenuItems: StudentMenuItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/student/dashboard", icon: DashboardRounded },
  { key: "schedule", label: "My Schedule", href: "/student/schedule", icon: CalendarMonthRounded },
  { key: "attendance", label: "Attendance", href: "/student/attendance", icon: EventAvailableRounded },
  { key: "results", label: "My Results", href: "/student/results", icon: LeaderboardRounded },
  { key: "fees", label: "My Fees", href: "/student/fees", icon: DescriptionRounded },
  { key: "materials", label: "Materials", href: "/student/materials", icon: FolderOpenRounded },
  { key: "assignments", label: "Assignments", href: "/student/assignments", icon: AssignmentRounded },
  { key: "notices", label: "Notices", href: "/student/notices", icon: NotificationsNoneRounded },
  { key: "profile", label: "My Profile", href: "/student/profile", icon: PersonRounded },
];
