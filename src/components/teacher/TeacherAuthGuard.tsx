"use client";

import type { ReactNode } from "react";
import { DashboardAccessGuard } from "@/components/auth/DashboardAccessGuard";

// Teachers (and head teachers) may stay here. Everyone else is redirected to the
// dashboard the role registry picks for them. See src/lib/auth/roles.ts.
export function TeacherAuthGuard({ children }: { children: ReactNode }) {
  return (
    <DashboardAccessGuard dashboardKey="teacher">{children}</DashboardAccessGuard>
  );
}
