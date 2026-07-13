import type { ElementType } from "react";
import {
  AdminPanelSettingsRounded,
  SchoolRounded,
  CastForEducationRounded,
  GroupsRounded,
  BusinessRounded,
} from "@mui/icons-material";
import type { DashboardKey } from "@/lib/auth/roles";

// UI metadata for each dashboard, keyed by DashboardKey. Kept out of roles.ts so
// the pure-logic module stays free of React/MUI imports (Cypress imports it).
export type DashboardMeta = {
  label: string;
  description: string;
  icon: ElementType;
};

export const DASHBOARD_META: Record<DashboardKey, DashboardMeta> = {
  bongo: {
    label: "Platform Admin",
    description: "Manage the Bongo platform and every center.",
    icon: AdminPanelSettingsRounded,
  },
  student: {
    label: "Student Portal",
    description: "Your classes, results, and notices.",
    icon: SchoolRounded,
  },
  teacher: {
    label: "Teacher Console",
    description: "Schedule, attendance, exams, and payroll.",
    icon: CastForEducationRounded,
  },
  hr: {
    label: "HR Portal",
    description: "Staff, payroll, and leave management.",
    icon: GroupsRounded,
  },
  centerAdmin: {
    label: "Admin Console",
    description: "Run your coaching center end to end.",
    icon: BusinessRounded,
  },
};
